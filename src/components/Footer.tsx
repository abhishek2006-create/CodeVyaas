import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <footer className="relative border-t border-border mt-auto glass-panel border-l-0 border-r-0 border-b-0 rounded-none">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image
            src="/compiler.png"
            alt="logo"
            className="text-primary size-10"
            height={100}
            width={100} 
            />
            <span>Built for developers, by Abhishek And Aditya Raj</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
