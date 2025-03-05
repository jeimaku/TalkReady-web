import { useState } from "react";
import { Star, Smile, Meh, Frown } from "lucide-react";
import { Button, Card, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { motion } from "framer-motion";

const ShareFeedback = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (feedback && rating) {
      setOpen(true); // Open dialog when submitted
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-3xl p-8 bg-white shadow-xl rounded-2xl">
          <motion.h2 
            className="text-3xl font-semibold text-gray-800 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Share Your Feedback
          </motion.h2>
          <p className="text-gray-600 text-lg text-center mt-3">Your feedback helps us improve TalkReady!</p>

          {/* Emoji-based Rating */}
          <div className="flex justify-center space-x-6 my-6">
            {[
              { icon: <Frown className="text-red-500" />, value: 1 },
              { icon: <Meh className="text-yellow-500" />, value: 2 },
              { icon: <Smile className="text-green-500" />, value: 3 },
              { icon: <Star className="text-blue-500" />, value: 4 },
            ].map(({ icon, value }) => (
              <motion.button
                key={value}
                className={`text-5xl transition-transform hover:scale-150 ${
                  rating === value ? "scale-150" : ""
                }`}
                onClick={() => setRating(value)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              >
                {icon}
              </motion.button>
            ))}
          </div>

          {/* Feedback Text Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-6 text-lg"
            />
          </motion.div>

          {/* Submit Button */}
          <div className="text-center mt-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!feedback || !rating}
                className="mt-4 px-6 py-3 text-lg"
              >
                Submit Feedback
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Feedback Confirmation Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle className="text-xl">Thank You! 🎉</DialogTitle>
        <DialogContent>
          <p className="text-lg">Your feedback has been received. We appreciate your time!</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShareFeedback;
