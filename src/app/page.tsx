"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { summarizeLegalInformation, type SummarizeLegalInformationOutput } from "@/ai/flows/summarize-legal-information";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Scale, Search, BookUser, Gavel, FileText, FileSignature, TriangleAlert, Link as LinkIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  legalQuestion: z.string().min(10, {
    message: "Your question must be at least 10 characters long.",
  }),
});

const topics = [
  { name: "Tenant and renter rights", icon: BookUser, query: "What are my rights and responsibilities as a tenant?" },
  { name: "Small claims court procedures", icon: Gavel, query: "Explain the process of small claims court." },
  { name: "Residential lease agreements", icon: FileText, query: "What are the key elements of a residential lease agreement?" },
  { name: "Basics of contract law", icon: FileSignature, query: "Summarize the basics of contract law." },
];

export default function LegalEasePage() {
  const [summary, setSummary] = useState<SummarizeLegalInformationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legalQuestion: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }
  
  const handleTopicClick = (query: string) => {
    form.setValue("legalQuestion", query);
    form.handleSubmit(onSubmit)();
  };

  const ResultSkeleton = () => (
    <Card className="mt-8 w-full">
      <CardHeader>
        <Alert className="border-accent border-l-4">
          <Skeleton className="h-4 w-4" />
          <AlertTitle><Skeleton className="h-5 w-24" /></AlertTitle>
          <AlertDescription>
            <Skeleton className="h-4 w-full" />
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <CardTitle className="mb-4"><Skeleton className="h-8 w-48" /></CardTitle>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 border-t pt-6">
        <Skeleton className="h-6 w-40" />
        <div className="w-full space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardFooter>
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
            Your AI assistant for clear, easy-to-understand general legal information. Ask a question or select a topic to get started.
          </p>
        </header>

        <main className="mt-12">
          <Card className="p-4 sm:p-6 shadow-lg border-2 border-transparent focus-within:border-primary transition-colors duration-300">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
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
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                  {isLoading ? (
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
                    disabled={isLoading}
                  >
                    <topic.icon className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{topic.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResultSkeleton />
              </motion.div>
            )}

            {summary && !isLoading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="mt-8 w-full shadow-lg">
                  <CardHeader>
                    <Alert className="border-accent border-l-4 rounded-r-lg bg-accent/10">
                      <TriangleAlert className="h-4 w-4 text-accent-foreground" />
                      <AlertTitle className="font-semibold text-accent-foreground">Disclaimer</AlertTitle>
                      <AlertDescription>
                        {summary.disclaimer}
                      </AlertDescription>
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
        </main>
      </div>
    </div>
  );
}
