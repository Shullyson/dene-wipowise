import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const Overview = () => {
  return (
    <>
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.75 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl mx-auto items-center justify-center">
        <p className="flex flex-row justify-center gap-4 items-center">
      
        </p>
        <p className="flex flex-col items-center justify-center">
          Welcome <strong>WipoWise Agent</strong>
          <MessageCircle size={44}/>
        </p>
      </div>
    </motion.div>
    </>
  );
};
