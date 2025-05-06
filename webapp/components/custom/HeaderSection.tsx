import { motion } from 'framer-motion';

export default function HeaderSection() {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-orange-800">Bitcoin Price Tomorrow</h1>
      <h2 className="text-xl text-orange-600 mt-2">btcpricetomorrow.com</h2>
      <p className="text-sm text-orange-700 mt-4">
        Predictions are made daily at 00:00 for the Bitcoin price at 00:00 the following day.
      </p>
    </motion.div>
  );
}
