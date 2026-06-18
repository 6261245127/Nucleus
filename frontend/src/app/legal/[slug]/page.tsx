import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/landing/LandingNav';
import Footer from '@/components/landing/LandingFooter';
import ReactMarkdown from 'react-markdown';

export const revalidate = 3600; // revalidate every hour

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await prisma.cMSLegalPage.findUnique({
    where: { slug }
  });

  if (!page || !page.isPublished) {
    return {
      title: 'Page Not Found | The Social Bite'
    };
  }

  return {
    title: page.metaTitle || `${page.title} | The Social Bite`,
    description: page.metaDescription || `Read the ${page.title} for The Social Bite platform.`,
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  
  const page = await prisma.cMSLegalPage.findUnique({
    where: { slug }
  });

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {page.title}
            </h1>
            {page.effectiveDate && (
              <p className="text-muted-foreground text-sm font-medium">
                Effective Date: {new Date(page.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-xl shadow-primary/5">
            <div className="prose prose-invert prose-primary max-w-none">
              {/* If content contains HTML it's rendered, otherwise we use markdown if we want. For safety and flexibility, standard rendering is fine. Here we assume markdown. */}
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
