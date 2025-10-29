import { WalletButton } from "@/components/WalletButton";
import { MessageCircle, Shield, Lock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">CipherChat</h1>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            Secure Messaging on Solana
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            End-to-end encrypted messaging powered by blockchain technology.
            Your conversations, truly private.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg border border-border bg-muted/50">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">End-to-End Encrypted</h3>
              <p className="text-muted-foreground">
                Military-grade encryption ensures only you and your recipient can read messages
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-muted/50">
              <Lock className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Blockchain Secured</h3>
              <p className="text-muted-foreground">
                Messages stored on Solana with decentralized security
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-muted/50">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Built on Solana for instant message delivery
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16">
            <p className="text-lg text-muted-foreground mb-4">
              Connect your Solana wallet to get started
            </p>
            <WalletButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Built with Next.js, Solana, and encryption technologies</p>
        </div>
      </footer>
    </div>
  );
}
