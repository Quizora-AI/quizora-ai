
import { useState, useRef } from "react";
import { Upload, File, X, Check, Loader2, AlertTriangle, FileWarning, AlertCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

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

    // AIMLAPI only supports image formats
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Unsupported file type",
        description: "Currently only image files (JPEG, PNG) are supported due to API limitations. Please convert your document to images before uploading.",
        variant: "destructive"
      });
      return;
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 20MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB. Please split or compress your document.`,
        variant: "destructive"
      });
      return;
    }

    // Smaller file size recommendation for better processing
    const RECOMMENDED_SIZE = 2 * 1024 * 1024; // 2MB
    if (selectedFile.size > RECOMMENDED_SIZE) {
      toast({
        title: "Large file detected",
        description: "For optimal results, consider using files under 2MB. Larger files may encounter API limitations.",
        variant: "default"
      });
    }

    setFile(selectedFile);
    setErrorMessage(null);
    setApiErrorDetails(null);
    setWasTruncated(false);
    setRetryCount(0);

    // Create preview for image files
    if (selectedFile.type.startsWith('image/')) {
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

    // AIMLAPI only supports image formats
    if (!droppedFile.type.startsWith('image/')) {
      toast({
        title: "Unsupported file type",
        description: "Currently only image files (JPEG, PNG) are supported due to API limitations. Please convert your document to images before uploading.",
        variant: "destructive"
      });
      return;
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (droppedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 20MB. Your file is ${(droppedFile.size / 1024 / 1024).toFixed(2)}MB. Please split or compress your document.`,
        variant: "destructive"
      });
      return;
    }

    // Smaller file size recommendation for better processing
    const RECOMMENDED_SIZE = 2 * 1024 * 1024; // 2MB
    if (droppedFile.size > RECOMMENDED_SIZE) {
      toast({
        title: "Large file detected",
        description: "For optimal results, consider using files under 2MB. Larger files may encounter API limitations.",
        variant: "default"
      });
    }

    setFile(droppedFile);
    setErrorMessage(null);
    setApiErrorDetails(null);
    setWasTruncated(false);
    setRetryCount(0);

    // Create preview for image files
    if (droppedFile.type.startsWith('image/')) {
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
        return prev + 2;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setErrorMessage(null);
    setApiErrorDetails(null);
    setWasTruncated(false);
    
    const clearProgressSimulation = simulateProgress();
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log(`Sending ${file.name} (${file.type}, ${(file.size/1024/1024).toFixed(2)}MB) for processing`);
      
      // Set a shorter timeout for API limitations
      const timeoutMs = 60000; // 60 seconds timeout
      
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
        throw new Error('No questions could be extracted from the document. Try a different file or format.');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      
      clearProgressSimulation();
      setProcessingProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
      setErrorMessage(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Improved error handling for specific errors
      if (errorMessage.includes('Unsupported file type') || errorMessage.includes('Invalid MIME type')) {
        setApiErrorDetails('Currently only image files (JPEG, PNG) are supported. Please convert your PDF or document to images before uploading.');
      } else if (errorMessage.includes('Maximum call stack size exceeded') || errorMessage.includes('too large')) {
        setApiErrorDetails('Try uploading a smaller document or splitting it into multiple parts.');
      } else if (errorMessage.includes('timed out') || errorMessage.includes('aborted')) {
        setApiErrorDetails('The request took too long. Try with a smaller document or a different section.');
      } else if (errorMessage.includes('API key')) {
        setApiErrorDetails('There was an issue with the API connection. Please try again later or contact support.');
      } else if (errorMessage.includes('No questions could be extracted')) {
        setApiErrorDetails('Make sure your document contains text that can be processed. Try a clearer document with question/answer structures.');
      } else if (errorMessage.includes('AIMLAPI credit limit')) {
        setApiErrorDetails('The API credit limit has been reached. Try using a smaller document, or try again later.');
      } else if (errorMessage.includes('Invalid response from AIMLAPI')) {
        setApiErrorDetails('The API encountered an issue processing your document. Try using a smaller or simpler document.');
      }
      
      toast({
        title: "Processing error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsProcessing(false);
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
          accept=".jpg,.jpeg,.png"
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
              <ImageIcon className="h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium mb-2">Drag & Drop your image file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Supported formats: JPEG, PNG</p>
              <p className="text-xs text-muted-foreground">Maximum file size: <strong>20MB</strong></p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Important:</strong> PDFs are not supported. Please convert your documents to images before uploading.
              </p>
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
                {file.size > 2 * 1024 * 1024 && (
                  <p className="text-xs text-amber-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Large file - may encounter API limitations
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
                {errorMessage.includes('Unsupported file type') && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium">How to convert documents to images:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Take screenshots of your document</li>
                      <li>Use online PDF to JPG/PNG converters</li>
                      <li>Export as images from your document software</li>
                    </ul>
                  </div>
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
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          className="w-full"
          disabled={!file || isProcessing}
          onClick={processFile}
        >
          {isProcessing ? "Processing..." : "Process Document"}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Due to API limitations, currently only image files (JPEG, PNG) are supported.
          <br />If you have a PDF, please convert it to images before uploading.
        </p>
      </CardFooter>
    </Card>
  );
}
