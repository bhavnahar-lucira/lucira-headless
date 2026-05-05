"use client";
import { useEffect } from "react";

export default function WebEngageInit() {
  useEffect(() => {
    if (window.webengage && window.webengage.track) return;

    (function (w, d, b) {
      var we = (w[b] = w[b] || {});
      we.__queue = we.__queue || [];
      we.__v = "6.0";
      we.user = we.user || {};

      const methods = ["track", "screen", "onReady"];
      methods.forEach((method) => {
        we[method] = function () {
          we.__queue.push([method, arguments]);
        };
      });

      const userMethods = ["login", "logout", "setAttribute"];
      userMethods.forEach((method) => {
        we.user[method] = function () {
          we.__queue.push(["user." + method, arguments]);
        };
      });

      // Load SDK
      const s = d.createElement("script");
      s.async = true;
      s.src = "https://ssl.widgets.webengage.com/js/webengage-min-v-6.0.js";
      d.head.appendChild(s);
    })(window, document, "webengage");

    // wait until real SDK replaces proxy
    const wait = setInterval(() => {
      if (window.webengage && window.webengage.init) {
        window.webengage.init("11b56595a");
        console.log("✅ WebEngage Fully Ready");
        clearInterval(wait);
      }
    }, 50);
  }, []);

  return null;
}
