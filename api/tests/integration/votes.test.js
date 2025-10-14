const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Vote = require('../../models/Vote');

let app;
let mongoServer;

describe('Vote Service API Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app = require('../../app'); // should export an express() instance
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await Vote.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    if (app && app.close) app.close(); // optional if app.listen() is wrapped
  });

  // --- TESTS ---

  it('POST /votes should create an upvote successfully', async () => {
    const response = await request(app)
      .post('/api/votes/addVote')
      .send({ vote: 'up' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('upVote', true);

    const votesInDb = await Vote.find();
    expect(votesInDb.length).toBe(1);
    expect(votesInDb[0].upVote).toBe(true);
  });

  it('POST /votes should create a downvote successfully', async () => {
    const response = await request(app)
      .post('/api/votes/addVote')
      .send({ vote: 'down' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('upVote', false);

    const votesInDb = await Vote.find();
    expect(votesInDb.length).toBe(1);
    expect(votesInDb[0].upVote).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    // Mock save() to throw an error
    jest.spyOn(Vote.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Fake DB error');
    });

    const response = await request(app)
      .post('/api/votes/addVote')
      .send({ vote: 'up' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Error creating vote');
  });

  it('GET /api/votes/today should return correct upvote and downvote counts', async () => {
    // Create votes manually
    await Vote.create([
      { upVote: true, date: new Date() },
      { upVote: true, date: new Date() },
      { upVote: false, date: new Date() }
    ]);

    const response = await request(app).get('/api/votes/getVotes');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.upvotes).toBe(2);
    expect(response.body.downvotes).toBe(1);
  });

  it('GET /api/votes/today should handle database errors gracefully', async () => {
    // Mock countDocuments to throw an error
    jest.spyOn(Vote, 'countDocuments').mockImplementationOnce(() => {
      throw new Error('Fake DB count error');
    });

    const response = await request(app).get('/api/votes/getVotes');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Error fetching votes');
  });
});
