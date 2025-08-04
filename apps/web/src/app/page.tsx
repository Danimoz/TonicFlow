import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { ArrowRight, CheckCircle, Music, Play } from "lucide-react";
import { features, testimonials } from "./page.constants";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-(image:--gradient-hero)">
        <div className="absolute inset-0 bg-(image:--gradient-mesh)"/>
        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <div className="text-center max-w-5xl mx-auto space-y-12">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Music className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">AI Powered Notation Engine</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-foreground leading-tight tracking-tight">
                Modern
                <span className="bg-(image:--gradient-primary) bg-clip-text text-transparent"> Tonic Solfa</span>
                <br />
                <span className="text-4xl md:text-6xl text-muted-foreground font-medium">Notation Software</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Create, edit, and share beautiful tonic solfa sheet music with our intuitive text-based editor and professional engraving engine powered by modern web technologies.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-10 py-7 shadow-elegant hover:shadow-glow transition-all duration-500 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-0"
              >
                Start Creating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-7 border-2 border-muted-foreground/20 hover:border-accent/50 hover:bg-accent/10 backdrop-blur-sm"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                No downloads required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Works everywhere
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-(image:--gradient-mesh) opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
              Everything You Need for
              <span className="bg-(image:--gradient-primary) bg-clip-text text-transparent"> Perfect Notation</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Powerful features designed specifically for tonic solfa music creation and collaboration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-(image:--gradient-card) border-border/50 hover:shadow-card hover:border-primary/20 transition-all duration-500 group backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 group-hover:scale-110">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8">
              See It In Action
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Watch how easy it is to create professional tonic solfa notation with our modern interface.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden shadow-notation border-border/50 bg-gradient-card backdrop-blur-sm">
              <div className="aspect-video bg-(image:--gradient-hero) flex items-center justify-center relative">
                <div className="absolute inset-0 bg-(image:--gradient-mesh) opacity-50"></div>
                <div className="text-center space-y-6 relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-primary/20 hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <Play className="h-12 w-12 text-primary ml-1" />
                  </div>
                  <p className="text-xl text-muted-foreground">
                    Interactive Demo Coming Soon
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Loved by Musicians
              <span className="text-primary"> Worldwide</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of educators, composers, and musicians who trust our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-8">
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="pricing" className="py-24 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br from-white to-accent bg-clip-text text-transparent">10K+</div>
              <div className="text-primary-foreground/90 text-lg">Active Users</div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br from-white to-accent bg-clip-text text-transparent">50K+</div>
              <div className="text-primary-foreground/90 text-lg">Projects Created</div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br from-white to-accent bg-clip-text text-transparent">100+</div>
              <div className="text-primary-foreground/90 text-lg">Countries</div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br from-white to-accent bg-clip-text text-transparent">99.9%</div>
              <div className="text-primary-foreground/90 text-lg">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-(ima" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Ready to Transform Your
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Music Creation?</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join the revolution in tonic solfa notation. Start creating beautiful sheet music today with our modern, intuitive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="text-lg px-12 py-8 shadow-elegant hover:shadow-glow transition-all duration-500 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-0"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-12 py-8 border-2 border-muted-foreground/20 hover:border-accent/50 hover:bg-accent/10 backdrop-blur-sm"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Tonic Solfa</span>
            </div>
            <p className="text-muted-foreground mb-8 text-lg">
              Modern notation software for the digital age
            </p>
            <div className="flex justify-center gap-8 text-muted-foreground mb-8">
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 transform duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 transform duration-200">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 transform duration-200">Support</a>
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 transform duration-200">Contact</a>
            </div>
            <div className="pt-8 border-t border-border/50">
              <p className="text-muted-foreground">
                © 2024 Tonic Solfa. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
