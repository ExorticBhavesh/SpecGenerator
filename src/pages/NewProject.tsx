import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Send, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { useStartPipeline } from '../hooks/usePipeline';
import { useNavigate } from 'react-router-dom';
import type { StartPipelineDto } from '../types/pipeline';

const stages = [
  { name: 'Parse Input', description: 'Analyzing requirements' },
  { name: 'Generate Schema', description: 'Creating data structure' },
  { name: 'Build APIs', description: 'Generating endpoints' },
  { name: 'Setup Auth', description: 'Configuring authentication' },
  { name: 'Deploy Config', description: 'Finalizing configuration' },
];

export default function NewProjectPage() {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  const startPipeline = useStartPipeline();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setCurrentStage(0);

    try {
      const dto: StartPipelineDto = { requirements: prompt };
      const result = await startPipeline.mutateAsync(dto);

      // Simulate progress through stages
      for (let i = 0; i < stages.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCurrentStage(i + 1);
      }

      // Navigate to pipeline inspector after completion
      setTimeout(() => {
        navigate(`/pipeline/${result.id}`);
      }, 500);
    } catch (error) {
      setIsProcessing(false);
      setCurrentStage(0);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Project</h1>
        <p className="text-muted-foreground">
          Describe your AI application configuration in natural language, and we&apos;ll generate the complete setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="glass rounded-xl p-6"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="prompt" className="block text-sm font-semibold text-foreground mb-3">
                Project Description
              </label>
              <motion.textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Build an e-commerce platform with user authentication, product listings, and shopping cart functionality..."
                className="w-full h-48 bg-input border border-white/10 rounded-lg p-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                disabled={isProcessing}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="submit"
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 text-primary-foreground font-medium transition-all"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="w-4 h-4 mr-2" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Generate Configuration
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        </div>

        {/* Progress Section */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-xl p-6"
              >
                <motion.h2
                  className="text-lg font-bold text-foreground mb-6 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Zap className="w-5 h-5 text-secondary" />
                  Processing Pipeline
                </motion.h2>
                <div className="space-y-3">
                  {stages.map((stage, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 group"
                    >
                      <div className="flex-shrink-0 mt-1 relative">
                        {index < currentStage ? (
                          <motion.div
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/40 to-green-600/40 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          >
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 0.5 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </motion.div>
                          </motion.div>
                        ) : index === currentStage ? (
                          <motion.div
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center pulse-glow"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader2 className="w-5 h-5 text-primary" />
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center group-hover:bg-muted/60 transition-colors"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          >
                            <span className="text-xs font-semibold text-muted-foreground">{index + 1}</span>
                          </motion.div>
                        )}
                      </div>
                      <motion.div
                        className="flex-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        <p className={`text-sm font-semibold transition-colors ${
                          index <= currentStage ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {stage.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-xl p-6 h-full flex items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <p className="text-muted-foreground mb-2">Enter a project description to get started</p>
                  <p className="text-xs text-muted-foreground/60">
                    The configuration will be generated through 5 processing stages
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
