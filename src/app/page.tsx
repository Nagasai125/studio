
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { summarizeLegalInformation, type SummarizeLegalInformationOutput } from "@/ai/flows/summarize-legal-information";
import { extractLeaseClauses, type ExtractLeaseClausesOutput } from "@/ai/flows/extract-lease-clauses";
import { analyzeText, type AnalyzeTextOutput } from "@/ai/flows/analyze-text";
import { answerDocumentQuestion, type AnswerDocumentQuestionOutput } from "@/ai/flows/answer-document-question";
import { extractDocumentText } from "@/ai/flows/extract-document-text";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Scale, Search, BookUser, Gavel, FileText, FileSignature, TriangleAlert, Link as LinkIcon, Loader2, Upload, MessageSquareText, ShieldAlert, Car, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const legalQuestionSchema = z.object({
  legalQuestion: z.string().min(1, "Please enter a question."),
});

const fileUploadSchema = z.object({
  file: typeof window !== 'undefined' 
    ? z.instanceof(File).refine(file => file.size > 0, "Please select a file.")
    : z.any(),
});

const textAnalysisSchema = z.object({
  textToAnalyze: z.string().min(1, "Please enter some text to analyze."),
});

const followUpQuestionSchema = z.object({
  followUpQuestion: z.string().min(1, "Please enter a question."),
});

const topics = [
  { name: "Tenant and renter rights", icon: BookUser, query: "What are my rights and responsibilities as a tenant?" },
  { name: "Small claims court procedures", icon: Gavel, query: "Explain the process of small claims court." },
  { name: "Residential lease agreements", icon: FileText, query: "What are the key elements of a residential lease agreement?" },
  { name: "Traffic violations", icon: Car, query: "What should I do if I get a speeding ticket?" },
];

export default function LegalEasePage() {
  const [summary, setSummary] = useState<SummarizeLegalInformationOutput | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  
  const [docAnalysis, setDocAnalysis] = useState<ExtractLeaseClausesOutput | null>(null);
  const [isLoadingDocAnalysis, setIsLoadingDocAnalysis] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedDocText, setExtractedDocText] = useState<string | null>(null);

  const [textAnalysis, setTextAnalysis] = useState<AnalyzeTextOutput | null>(null);
  const [isLoadingTextAnalysis, setIsLoadingTextAnalysis] = useState(false);

  const [followUpAnswer, setFollowUpAnswer] = useState<AnswerDocumentQuestionOutput | null>(null);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);


  const { toast } = useToast();

  const legalQuestionForm = useForm<z.infer<typeof legalQuestionSchema>>({
    resolver: zodResolver(legalQuestionSchema),
    defaultValues: { legalQuestion: "" },
  });

  const fileUploadForm = useForm<z.infer<typeof fileUploadSchema>>({
    resolver: zodResolver(fileUploadSchema),
  });

  const textAnalysisForm = useForm<z.infer<typeof textAnalysisSchema>>({
    resolver: zodResolver(textAnalysisSchema),
    defaultValues: { textToAnalyze: "" },
  });

  const followUpQuestionForm = useForm<z.infer<typeof followUpQuestionSchema>>({
    resolver: zodResolver(followUpQuestionSchema),
    defaultValues: { followUpQuestion: "" },
  });

  async function onLegalQuestionSubmit(values: z.infer<typeof legalQuestionSchema>) {
    setIsLoadingSummary(true);
    setSummary(null);
    try {
      const result = await summarizeLegalInformation(values);
      setSummary(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get legal summary. Please try again later.",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setDocAnalysis(null);
      setExtractedDocText(null);
      setFollowUpAnswer(null); 
      followUpQuestionForm.reset();
      fileUploadForm.setValue("file", file);
      fileUploadForm.clearErrors("file");
    }
  };

  function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onFileUploadSubmit(values: z.infer<typeof fileUploadSchema>) {
    setIsLoadingDocAnalysis(true);
    setDocAnalysis(null);
    setExtractedDocText(null);
    setFollowUpAnswer(null);
    followUpQuestionForm.reset();
    try {
      const dataUri = await fileToDataUri(values.file);
      
      // We now run two flows in parallel: one to extract structured data, one to get raw text
      const [analysisResult, textResult] = await Promise.all([
        extractLeaseClauses({ leaseAgreementDataUri: dataUri }),
        extractDocumentText({ documentDataUri: dataUri })
      ]);
      
      setDocAnalysis(analysisResult);
      if (textResult) {
        setExtractedDocText(textResult.documentText);
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to analyze document. Please try again later.",
      });
    } finally {
      setIsLoadingDocAnalysis(false);
    }
  }

  async function onTextAnalysisSubmit(values: z.infer<typeof textAnalysisSchema>) {
    setIsLoadingTextAnalysis(true);
    setTextAnalysis(null);
    try {
      const result = await analyzeText(values);
      setTextAnalysis(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to analyze text. Please try again later.",
      });
    } finally {
      setIsLoadingTextAnalysis(false);
    }
  }

  async function onFollowUpQuestionSubmit(values: z.infer<typeof followUpQuestionSchema>) {
    if (!extractedDocText) return;
    setIsLoadingFollowUp(true);
    setFollowUpAnswer(null);
    try {
      const result = await answerDocumentQuestion({
        documentText: extractedDocText,
        question: values.followUpQuestion
      });
      setFollowUpAnswer(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to answer the question. Please try again later.",
      });
    } finally {
      setIsLoadingFollowUp(false);
    }
  }
  
  const handleTopicClick = (query: string) => {
    legalQuestionForm.setValue("legalQuestion", query);
    onLegalQuestionSubmit({ legalQuestion: query });
  };

  const ResultSkeleton = () => (
    <Card className="mt-8 w-full">
      <CardHeader>
        <Skeleton className="h-5 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );

  const SpamCard = ({ reason }: { reason?: string }) => (
    <Card className="mt-8 w-full shadow-lg border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          <CardTitle className="text-2xl font-headline text-destructive">Content Flagged</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-foreground/90">
        {reason ? reason.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        )) : <p>This content was flagged as irrelevant or spam and could not be processed.</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 md:py-20">
        <header className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4 shadow-lg">
              <Scale className="h-10 w-10" />
            </div>
          </motion.div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            LegalEase
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Your AI assistant for clear, easy-to-understand general legal information.
          </p>
        </header>

        <main className="mt-12">
          <Tabs defaultValue="question" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="question">Ask a Question</TabsTrigger>
              <TabsTrigger value="document">Analyze Document</TabsTrigger>
              <TabsTrigger value="text">Analyze Text</TabsTrigger>
            </TabsList>
            <TabsContent value="question">
              <Card className="p-4 sm:p-6 shadow-lg border-2 border-transparent">
                <Form {...legalQuestionForm}>
                  <form onSubmit={legalQuestionForm.handleSubmit(onLegalQuestionSubmit)} className="space-y-6">
                    <FormField
                      control={legalQuestionForm.control}
                      name="legalQuestion"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="e.g., 'What are my rights as a tenant in California?'"
                                className="pl-10 text-base h-12"
                                {...field}
                                disabled={isLoadingSummary}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isLoadingSummary}>
                      {isLoadingSummary ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Get Summary"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6">
                  <p className="text-center text-sm font-medium text-muted-foreground mb-4">Or start with a common topic:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topics.map((topic) => (
                      <Button
                        key={topic.name}
                        variant="outline"
                        className="justify-start text-left h-auto py-3"
                        onClick={() => handleTopicClick(topic.query)}
                        disabled={isLoadingSummary}
                      >
                        <topic.icon className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                        <span>{topic.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              <AnimatePresence>
                {isLoadingSummary && (
                  <motion.div
                    key="loader-summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultSkeleton />
                  </motion.div>
                )}

                {summary && !isLoadingSummary && (
                  <motion.div
                    key="results-summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="mt-8 w-full shadow-lg">
                      <CardHeader>
                        <Alert className="border-accent border-l-4 rounded-r-lg bg-accent/10">
                          <TriangleAlert className="h-4 w-4 text-accent-foreground" />
                          <AlertTitle className="font-semibold text-accent-foreground">Disclaimer</AlertTitle>
                          <AlertDescription>{summary.disclaimer}</AlertDescription>
                        </Alert>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="mb-4 text-2xl font-headline">Summary</CardTitle>
                        <div className="space-y-4 text-foreground/90">
                          {summary.summary.split('\n\n').flatMap(p => p.split('\n')).map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </CardContent>
                      {summary.resourceLinks && summary.resourceLinks.length > 0 && (
                        <CardFooter className="flex-col items-start gap-2 border-t pt-6">
                          <h3 className="text-lg font-semibold font-headline">Official Resources</h3>
                          <ul className="list-none space-y-2 pl-0 w-full">
                            {summary.resourceLinks.map((link, index) => (
                              <li key={index} className="flex items-start">
                                <LinkIcon className="h-4 w-4 mr-2 mt-1 text-primary flex-shrink-0" />
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4 break-all">
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </CardFooter>
                      )}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
            
            <TabsContent value="document">
              <Card className="p-4 sm:p-6 shadow-lg border-2 border-transparent">
                <Form {...fileUploadForm}>
                  <form onSubmit={fileUploadForm.handleSubmit(onFileUploadSubmit)} className="space-y-6">
                    <FormField
                      control={fileUploadForm.control}
                      name="file"
                      render={() => (
                        <FormItem>
                          <Label htmlFor="file-upload" className="font-semibold">Upload Document</Label>
                          <FormControl>
                            <div className="relative">
                              <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                disabled={isLoadingDocAnalysis}
                              />
                              <Label
                                htmlFor="file-upload"
                                className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus-within:border-primary"
                              >
                                {uploadedFile ? (
                                  <span className="text-foreground text-center">
                                    <FileText className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    {uploadedFile.name}
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-2">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">
                                      Click to upload or drag and drop
                                    </span>
                                  </span>
                                )}
                              </Label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isLoadingDocAnalysis || !uploadedFile}>
                      {isLoadingDocAnalysis ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Document...
                        </>
                      ) : (
                        "Analyze Document"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>

              <AnimatePresence>
                {isLoadingDocAnalysis && (
                  <motion.div
                    key="loader-analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultSkeleton />
                  </motion.div>
                )}

                {docAnalysis && !isLoadingDocAnalysis && (
                   <motion.div
                    key="results-analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {docAnalysis.isSpam ? (
                      <SpamCard reason={docAnalysis.spamReason} />
                    ) : (
                      <Card className="mt-8 w-full shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-2xl font-headline">Document Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-foreground/90">
                           {docAnalysis.summary?.split('\n\n').flatMap(p => p.split('\n')).map((paragraph, index) => (
                             <p key={index}>{paragraph}</p>
                           ))}
                        </CardContent>
                        
                        {extractedDocText && 
                          <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                              <h3 className="text-lg font-semibold font-headline">Ask a Follow-up Question</h3>
                              <Form {...followUpQuestionForm}>
                                <form onSubmit={followUpQuestionForm.handleSubmit(onFollowUpQuestionSubmit)} className="w-full space-y-4">
                                  <FormField
                                    control={followUpQuestionForm.control}
                                    name="followUpQuestion"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <div className="relative">
                                            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                              placeholder="e.g., 'What is the fine amount?'"
                                              className="pl-10 text-base h-12"
                                              {...field}
                                              disabled={isLoadingFollowUp}
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button type="submit" className="w-full h-12 text-lg" disabled={isLoadingFollowUp}>
                                    {isLoadingFollowUp ? (
                                      <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Thinking...
                                      </>
                                    ) : (
                                      "Ask Question"
                                    )}
                                  </Button>
                                </form>
                              </Form>
                          </CardFooter>
                        }
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {isLoadingFollowUp && (
                  <motion.div
                    key="loader-follow-up"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ResultSkeleton />
                  </motion.div>
                )}

                {followUpAnswer && !isLoadingFollowUp && (
                  <motion.div
                    key="results-follow-up"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="mt-8 w-full shadow-lg">
                      <CardHeader>
                        <Alert className="border-accent border-l-4 rounded-r-lg bg-accent/10">
                          <TriangleAlert className="h-4 w-4 text-accent-foreground" />
                          <AlertTitle className="font-semibold text-accent-foreground">Disclaimer</AlertTitle>
                          <AlertDescription>{followUpAnswer.disclaimer}</AlertDescription>
                        </Alert>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="mb-4 text-2xl font-headline">Answer</CardTitle>
                        <div className="space-y-4 text-foreground/90">
                          {followUpAnswer.answer.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="text">
              <Card className="p-4 sm:p-6 shadow-lg border-2 border-transparent">
                <Form {...textAnalysisForm}>
                  <form onSubmit={textAnalysisForm.handleSubmit(onTextAnalysisSubmit)} className="space-y-6">
                    <FormField
                      control={textAnalysisForm.control}
                      name="textToAnalyze"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="text-analysis" className="font-semibold">Text to Analyze</Label>
                          <FormControl>
                            <div className="relative">
                              <MessageSquareText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Textarea
                                id="text-analysis"
                                placeholder="Paste a message, a clause from a contract, or any other text here..."
                                className="pl-10 pt-3 text-base min-h-[150px] resize-y"
                                {...field}
                                disabled={isLoadingTextAnalysis}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isLoadingTextAnalysis}>
                      {isLoadingTextAnalysis ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Text...
                        </>
                      ) : (
                        "Analyze Text"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>

              <AnimatePresence>
                {isLoadingTextAnalysis && (
                  <motion.div
                    key="loader-text-analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultSkeleton />
                  </motion.div>
                )}

                {textAnalysis && !isLoadingTextAnalysis && (
                   <motion.div
                    key="results-text-analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {textAnalysis.isSpam ? (
                      <SpamCard reason={textAnalysis.spamReason} />
                    ) : (
                      <Card className="mt-8 w-full shadow-lg">
                        {textAnalysis.disclaimer &&
                          <CardHeader>
                            <Alert className="border-accent border-l-4 rounded-r-lg bg-accent/10">
                              <TriangleAlert className="h-4 w-4 text-accent-foreground" />
                              <AlertTitle className="font-semibold text-accent-foreground">Disclaimer</AlertTitle>
                              <AlertDescription>{textAnalysis.disclaimer}</AlertDescription>
                            </Alert>
                          </CardHeader>
                        }
                        <CardContent className={!textAnalysis.disclaimer ? "pt-6" : ""}>
                          <CardTitle className="mb-4 text-2xl font-headline">Analysis</CardTitle>
                          <div className="space-y-4 text-foreground/90">
                            {textAnalysis.analysis?.split('\n\n').flatMap(p => p.split('\n')).map((paragraph, index) => (
                              <p key={index}>{paragraph}</p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
