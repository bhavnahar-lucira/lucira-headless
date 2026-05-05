"use client";
import { useEffect } from "react";

export default function WebEngageProvider() {

  useEffect(() => {

    // prevent duplicate load
    if (window.webengage) return;

    const script = document.createElement("script");
    script.src = "https://ssl.widgets.webengage.com/js/webengage-min-v-6.0.js";
    script.async = true;

    script.onload = () => {
      waitForWebEngage();
    };

    document.body.appendChild(script);

    function waitForWebEngage() {
      if (window.webengage) {
        window.webengage.init("11b56595a");
        console.log("✅ WebEngage Initialized");
      } else {
        setTimeout(waitForWebEngage, 100);
      }
    }

  }, []);

  return null;
}
