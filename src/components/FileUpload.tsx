import { useState, useRef } from "react";
import { Upload, File, X, Check, Loader2, AlertTriangle, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFileProcessed: (questions: Question[]) => void;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);
  const [wasTruncated, setWasTruncated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const dropAreaVariants = {
    idle: { 
      scale: 1,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.15)"
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive"
      });
      return;
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 8MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB. Please split or compress your document.`,
        variant: "destructive"
      });
      return;
    }

    if (selectedFile.type === 'application/pdf' && selectedFile.size > 3 * 1024 * 1024) {
      toast({
        title: "Large PDF detected",
        description: "For better results, only the first portion will be processed. Consider using a smaller, more focused document.",
        variant: "default"
      });
    }

    setFile(selectedFile);
    setIsUsingMockData(false);
    setErrorMessage(null);
    setApiErrorDetails(null);
    setWasTruncated(false);
    setRetryCount(0);

    if (selectedFile.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(droppedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive"
      });
      return;
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
    if (droppedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 8MB. Your file is ${(droppedFile.size / 1024 / 1024).toFixed(2)}MB. Please split or compress your document.`,
        variant: "destructive"
      });
      return;
    }

    if (droppedFile.type === 'application/pdf' && droppedFile.size > 3 * 1024 * 1024) {
      toast({
        title: "Large PDF detected",
        description: "For better results, only the first portion will be processed. Consider using a smaller, more focused document.",
        variant: "default"
      });
    }

    setFile(droppedFile);
    setIsUsingMockData(false);
    setErrorMessage(null);
    setApiErrorDetails(null);
    setWasTruncated(false);
    setRetryCount(0);

    if (droppedFile.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setIsUsingMockData(false);
    setErrorMessage(null);
    setApiErrorDetails(null);
    setWasTruncated(false);
    setRetryCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 4;
      });
    }, 500);

    return () => clearInterval(interval);
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setIsUsingMockData(false);
    setErrorMessage(null);
    setApiErrorDetails(null);
    setWasTruncated(false);
    
    const clearProgressSimulation = simulateProgress();
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log(`Sending ${file.name} (${file.type}, ${(file.size/1024/1024).toFixed(2)}MB) for processing`);
      
      const timeoutMs = Math.min(120000, 20000 + (file.size / (1024 * 1024)) * 10000);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch('https://ltteeavnkygcgbwlblof.supabase.co/functions/v1/process-document', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      }).catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. The document may be too large or complex to process.');
        }
        throw err;
      });
      
      clearTimeout(timeoutId);
      clearProgressSimulation();
      setProcessingProgress(100);
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document');
      }
      
      if (data.questions && data.questions.length > 0) {
        if (data.metadata?.fileInfo?.truncated) {
          setWasTruncated(true);
          toast({
            title: "Large document detected",
            description: "Only the first portion of your document was processed. Results may be incomplete.",
            variant: "default"
          });
        }

        const questionsWithIds = data.questions.map((q: Question, index: number) => ({
          ...q,
          id: q.id || `q${index + 1}`
        }));

        setTimeout(() => {
          onFileProcessed(questionsWithIds);
          
          toast({
            title: "Document processed successfully",
            description: `${questionsWithIds.length} questions extracted from your document`,
            action: <Check className="h-4 w-4 text-green-500" />
          });
          
          setIsProcessing(false);
          setProcessingProgress(0);
        }, 500);
      } else {
        throw new Error('No questions could be extracted from the document');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      
      clearProgressSimulation();
      setProcessingProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
      setErrorMessage(errorMessage);
      setRetryCount(prev => prev + 1);
      
      if (errorMessage.includes('Maximum call stack size exceeded') || errorMessage.includes('too large')) {
        setApiErrorDetails('Try uploading a smaller portion of your document or splitting it into multiple parts.');
      } else if (errorMessage.includes('timed out') || errorMessage.includes('aborted')) {
        setApiErrorDetails('The request took too long. Try with a smaller document or a different section.');
      } else if (errorMessage.includes('Deepseek API key')) {
        setApiErrorDetails('The API key required for processing is not properly configured.');
      } else if (errorMessage.includes('No questions could be extracted')) {
        setApiErrorDetails('The document format may not be suitable. Try a document with clearer question/answer structures.');
      }
      
      toast({
        title: "Processing error",
        description: errorMessage,
        variant: "destructive"
      });
      
      const useMock = retryCount > 0 || 
        errorMessage.includes('API key') || 
        errorMessage.includes('Maximum call stack') ||
        errorMessage.includes('No questions could be extracted');
        
      if (useMock) {
        setTimeout(() => {
          const mockQuestions: Question[] = [
            {
              id: "q1",
              question: "Which of the following is NOT a primary treatment for acute myocardial infarction?",
              options: [
                "Aspirin",
                "Anticoagulation with heparin",
                "Primary percutaneous coronary intervention",
                "Calcium channel blockers"
              ],
              correctAnswer: 3,
              explanation: "Calcium channel blockers are not recommended as first-line therapy in acute MI. They may worsen outcomes in certain patients."
            },
            {
              id: "q2",
              question: "The most common cause of community-acquired pneumonia is:",
              options: [
                "Streptococcus pneumoniae",
                "Haemophilus influenzae",
                "Mycoplasma pneumoniae",
                "Klebsiella pneumoniae"
              ],
              correctAnswer: 0,
              explanation: "Streptococcus pneumoniae remains the most common cause of community-acquired pneumonia across most age groups."
            },
            {
              id: "q3",
              question: "Which antibody is most associated with the diagnosis of rheumatoid arthritis?",
              options: [
                "Anti-dsDNA",
                "Anti-CCP",
                "Anti-Smith",
                "Anti-Ro"
              ],
              correctAnswer: 1,
              explanation: "Anti-CCP (anti-cyclic citrullinated peptide) antibodies are highly specific for rheumatoid arthritis."
            },
            {
              id: "q4",
              question: "Which of the following is the first-line treatment for uncomplicated urinary tract infection?",
              options: [
                "Amoxicillin",
                "Ciprofloxacin",
                "Trimethoprim-sulfamethoxazole",
                "Nitrofurantoin"
              ],
              correctAnswer: 3,
              explanation: "Nitrofurantoin is recommended as first-line therapy for uncomplicated UTIs due to lower resistance rates."
            },
            {
              id: "q5",
              question: "The gold standard for diagnosis of pulmonary embolism is:",
              options: [
                "D-dimer test",
                "CT pulmonary angiography",
                "Ventilation-perfusion scan",
                "Chest X-ray"
              ],
              correctAnswer: 1,
              explanation: "CT pulmonary angiography is currently considered the gold standard for diagnosing pulmonary embolism."
            },
          ];

          onFileProcessed(mockQuestions);
          setIsUsingMockData(true);
          setIsProcessing(false);
        }, 1000);
      } else {
        setIsProcessing(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Upload Your Question Document</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        
        {!file ? (
          <motion.div 
            className="file-drop-area"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            initial="idle"
            whileHover="hover"
            variants={dropAreaVariants}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Upload className="h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium mb-2">Drag & Drop your file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <p className="text-xs text-muted-foreground mb-1">Supported formats: PDF, JPEG, PNG</p>
              <p className="text-xs text-muted-foreground">Maximum file size: <strong>8MB</strong></p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="border rounded-lg p-4 relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <button 
              className="absolute top-2 right-2 p-1 rounded-full bg-muted hover:bg-muted/80"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-4">
              {filePreview ? (
                <img 
                  src={filePreview} 
                  alt="File preview" 
                  className="h-24 object-cover rounded-md"
                />
              ) : (
                <File className="h-12 w-12 text-primary" />
              )}
              
              <div>
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
                {file.type === 'application/pdf' && file.size > 3 * 1024 * 1024 && (
                  <p className="text-xs text-amber-500 flex items-center mt-1">
                    <FileWarning className="h-3 w-3 mr-1" />
                    Large PDF - only first portion will be processed
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error processing document</AlertTitle>
              <AlertDescription>
                {errorMessage}
                {apiErrorDetails && (
                  <p className="text-sm mt-2">{apiErrorDetails}</p>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {isProcessing && (
          <motion.div 
            className="mt-4 p-4 bg-muted/50 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="font-medium">Processing your document...</span>
            </div>
            <Progress value={processingProgress} className="w-full h-2" />
            {processingProgress > 70 && (
              <p className="text-xs text-muted-foreground mt-2">
                Extracting questions from document... This may take a moment.
              </p>
            )}
          </motion.div>
        )}
        
        {wasTruncated && !isProcessing && (
          <motion.div 
            className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                <strong>Note:</strong> Only the first portion of your document was processed due to size limitations. For complete results, try splitting your document into smaller parts.
              </span>
            </p>
          </motion.div>
        )}
        
        {isUsingMockData && !isProcessing && (
          <motion.div 
            className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm">
              <strong>Note:</strong> Currently showing demo questions. The original document couldn't be processed due to technical limitations.
            </p>
          </motion.div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          disabled={!file || isProcessing}
          onClick={processFile}
        >
          {isProcessing ? "Processing..." : "Process Document"}
        </Button>
      </CardFooter>
    </Card>
  );
}
