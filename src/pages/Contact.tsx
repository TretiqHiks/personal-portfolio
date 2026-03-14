import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Linkedin, Github, Globe, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
};

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@alexchen.dev",
    href: "mailto:hello@alexchen.dev",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "/in/alexchen",
    href: "https://linkedin.com/in/alexchen",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "@alexchen",
    href: "https://github.com/alexchen",
  },
  {
    icon: Globe,
    label: "Blog",
    value: "alexchen.dev/blog",
    href: "https://alexchen.dev/blog",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    // Simulate send
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
    }, 1200);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
        {/* ── 1. Intro ── */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            Let's Connect
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            I'm always open to discussing new projects, creative collaborations,
            or interesting technical challenges. Whether you have an idea, a
            question, or just want to say hello — I'd love to hear from you.
          </p>
        </motion.section>

        {/* ── 2. Contact Methods ── */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contactMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={method.label}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="glass rounded-2xl p-5 flex flex-col items-center gap-3 text-center cursor-pointer group transition-all duration-300 hover:glow-blue hover:border-primary/20"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {method.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {method.value}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>

        {/* ── 3. Contact Form ── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="glass rounded-2xl p-8 md:p-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  maxLength={100}
                  className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50"
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  maxLength={255}
                  className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50"
                />
              </div>
              <Textarea
                placeholder="Your message..."
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                maxLength={1000}
                rows={5}
                className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50 resize-none"
              />
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={sending}
                  className="rounded-full px-8 py-2.5 text-sm font-medium gap-2"
                >
                  {sending ? "Sending…" : "Send Message"}
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </motion.section>

        {/* ── 4. Availability Note ── */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="pb-8"
        >
          <div className="glass rounded-2xl p-6 max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                Currently Available
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I'm open to full-time opportunities, freelance collaborations, and
              technical discussions. Feel free to reach out — I typically respond
              within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Job Opportunities", "Collaborations", "Technical Discussions"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Contact;
