import { ArrowDown, ArrowRight, ArrowUpRight, Braces, CodeXml, Layers3 } from "lucide-react";
import ModelBackdrop from "@/components/ModelBackdrop";
import { Reveal } from "./_components/HomeMotion";
import styles from "./home.module.css";

export default function Home() {
  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="CodeVyaas home">
          <span className={styles.brandMark}><CodeXml size={21} /></span>CodeVyaas
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#tools">Editor modes</a>
          <a href="/snippets">Snippets</a>
        </nav>
        <a className={styles.navAction} href="/workspace">Workspace <ArrowUpRight size={16} /></a>
      </header>

      <main>
        <section className={styles.hero} aria-label="CodeVyaas online IDE">
          <ModelBackdrop className={styles.characterBackdrop} />
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><span /> THE BROWSER-BASED IDE</p>
            <h1>Code without<br /><em>limits.</em></h1>
            <p className={styles.lede}>Practice algorithms, run code, and build web projects in one online IDE.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href="/workspace">Start Building <ArrowUpRight size={19} /></a>
              <a className={styles.secondary} href="#tools">Explore CodeVyaas <ArrowDown size={16} /></a>
            </div>
          </div>
          <a href="#tools" className={styles.scroll} aria-label="Scroll to editor modes"><ArrowDown size={16} /></a>
        </section>

        <section id="tools" className={styles.section} aria-labelledby="tools-title">
          <Reveal>
            <p className={styles.eyebrow}>THE WORKSPACE</p>
            <h2 id="tools-title">Two ways to code.</h2>
            <div className={styles.modes}>
              <a href="/workspace" className={styles.mode}>
                <span className={styles.modeIcon}><Braces /></span>
                <h3>DSA Editor</h3>
                <p>Test ideas and practice data structures and algorithms in a multi-language editor with live output.</p>
                <span className={styles.modeAction}>Open DSA Editor <ArrowRight size={17} /></span>
              </a>
              <a href="/development" className={styles.mode}>
                <span className={styles.modeIcon}><Layers3 /></span>
                <h3>Development</h3>
                <p>Start a web project from a framework template and preview it in your browser.</p>
                <span className={styles.modeAction}>Open Development <ArrowRight size={17} /></span>
              </a>
            </div>
          </Reveal>
        </section>

      </main>

      <footer className={styles.footer}>
        <a className={styles.brand} href="/"><CodeXml size={22} /> CodeVyaas</a>
        <span>Built for developers by Abhishek and Aditya Raj.</span>
        <nav aria-label="Footer navigation">
          <a href="/snippets">Snippets</a>
          <a href="/pricing">Pricing <ArrowUpRight size={14} /></a>
        </nav>
      </footer>
    </div>
  );
}
