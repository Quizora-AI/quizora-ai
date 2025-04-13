
import { useState, useRef } from "react";
import { Upload, File, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);

    // Create preview for image files
    if (selectedFile.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, just show an icon
      setFilePreview(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;

    // Validate file type
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(droppedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive"
      });
      return;
    }

    setFile(droppedFile);

    // Create preview for image files
    if (droppedFile.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      // For PDFs, just show an icon
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // In a real application, here we would:
    // 1. Upload the file to a backend server
    // 2. Process it with OCR/text extraction
    // 3. Parse the extracted text to identify questions, options, and answers
    
    // For now, let's simulate this with mock data after a delay
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
          correctAnswer: 3, // Index of the correct answer (0-based)
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
      toast({
        title: "File processed successfully",
        description: `${mockQuestions.length} questions extracted from your document`,
        action: <Check className="h-4 w-4 text-green-500" />
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8 animate-slide-up">
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
          <div 
            className="file-drop-area"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-medium mb-2">Drag & Drop your file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <p className="text-xs text-muted-foreground">Supported formats: PDF, JPEG, PNG</p>
          </div>
        ) : (
          <div className="border rounded-lg p-4 relative">
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
              </div>
            </div>
          </div>
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
