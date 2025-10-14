// tests/unit/email.test.js
const sendEmail = require('../../services/emailService');
const nodeMailer = require('nodemailer');

jest.mock('nodemailer');

describe('sendEmail', () => {
  let sendMailMock;

  beforeEach(() => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'mocked_message_id' });
    nodeMailer.createTransport.mockReturnValue({
      sendMail: sendMailMock
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send an email with correct details', async () => {
    const value = 42000.55;
    const email = 'user@example.com';

    await sendEmail(value, email);

    expect(nodeMailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: expect.objectContaining({
        user: 'noreply@btcpricetomorrow.com',
        pass: process.env.EMAIL_PASSWORD
      })
    }));

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      from: '"BTC Price Tomorrow" <noreply@btcpricetomorrow.com>',
      to: email,
      subject: 'Bitcoin Price Prediction for Tomorrow',
      html: expect.stringContaining('Bitcoin Price Prediction')
    }));
  });

  it('should format the value correctly in HTML', async () => {
    const value = 99999.456;
    const email = 'user2@example.com';

    await sendEmail(value, email);

    const sentHtml = sendMailMock.mock.calls[0][0].html;
    expect(sentHtml).toContain('$99.999,46'); // German number formatting
    expect(sentHtml).toContain(email);        // email appears in unsubscribe link
  });

  it('should handle transporter errors gracefully', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP failed'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await sendEmail(12345, 'fail@example.com');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error sending email:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
