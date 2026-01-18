// Crisp Chat Support Plugin - runs only on client side
export default defineNuxtPlugin(() => {
  // Don't load Crisp on the tickets page (it's shown in an iframe)
  if (window.location.pathname === '/tickets') {
    return;
  }

  // Initialize Crisp
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = "f1ba4410-d064-4d5e-a268-e08b4fdeb989";

  // Load Crisp script
  const script = document.createElement("script");
  script.src = "https://client.crisp.chat/l.js";
  script.async = true;
  document.head.appendChild(script);
});

// TypeScript declarations for Crisp
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}
