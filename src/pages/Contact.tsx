import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Linkedin, Github, Globe, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";
import content from "@/data/content.json";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
};

const iconMap = {
  Mail,
  Linkedin,
  Github,
  Globe,
};

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const t = content.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS env vars are not configured.");
      toast({
        title: t.toasts.errorTitle,
        description: t.toasts.errorDescription,
        variant: "destructive",
      });
      return;
    }

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast({
        title: t.toasts.missingFieldsTitle,
        description: t.toasts.missingFieldsDescription,
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({
        title: t.toasts.invalidEmailTitle,
        description: t.toasts.invalidEmailDescription,
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: trimmedName,
          from_email: trimmedEmail,
          message: trimmedMessage,
        },
        { publicKey }
      );
      setForm({ name: "", email: "", message: "" });
      toast({
        title: t.toasts.successTitle,
        description: t.toasts.successDescription,
      });
    } catch (err) {
      console.error("EmailJS send failed:", err);
      toast({
        title: t.toasts.errorTitle,
        description: t.toasts.errorDescription,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14 sm:space-y-20">
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t.intro}
          </p>
        </motion.section>

        <section>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {t.methods.map((method, i) => {
              const Icon = iconMap[method.icon as keyof typeof iconMap] ?? Mail;
              return (
                <motion.a
                  key={method.label}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="glass rounded-2xl p-5 flex flex-col items-center gap-3 text-center cursor-pointer group transition-all duration-300 hover:glow-primary hover:border-primary/20"
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

        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="glass rounded-2xl p-5 sm:p-8 md:p-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
              {t.form.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder={t.form.namePlaceholder}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={100}
                  className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50"
                />
                <Input
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  maxLength={255}
                  className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50"
                />
              </div>
              <Textarea
                placeholder={t.form.messagePlaceholder}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
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
                  {sending ? t.form.sending : t.form.send}
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </motion.section>

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
                {t.availability.title}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.availability.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {t.availability.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Contact;
