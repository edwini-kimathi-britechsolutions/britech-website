/* Britech admin — image uploads, confirmations, slug preview, SMTP port helper, pending buttons. */
(function () {
  "use strict";

  function csrf() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute("content") : "";
  }

  /** Uploads an image and resolves with its /media/… URL. Used by image fields and the blog editor. */
  window.britechUpload = function (file) {
    var body = new FormData();
    body.append("file", file);
    body.append("_csrf", csrf());
    return fetch("/admin/upload", { method: "POST", body: body, credentials: "same-origin", headers: { "X-CSRF-Token": csrf() } })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || !json.url) throw new Error(json.error || "Upload failed (the file may be too large for the server).");
          return json.url;
        });
      });
  };

  window.britechSlugify = function (s) {
    return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
  };

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* ------------------------------ image fields ------------------------------ */
    document.querySelectorAll("[data-image-field]").forEach(function (root) {
      var value = root.querySelector("[data-image-value]");
      var preview = root.querySelector("[data-image-preview]");
      var empty = root.querySelector("[data-image-empty]");
      var pick = root.querySelector("[data-image-pick]");
      var label = root.querySelector("[data-image-label]");
      var remove = root.querySelector("[data-image-remove]");
      var file = root.querySelector("[data-image-file]");
      var err = root.querySelector("[data-image-error]");

      function set(url) {
        value.value = url;
        preview.src = url;
        preview.classList.toggle("hidden", !url);
        empty.classList.toggle("hidden", !!url);
        remove.classList.toggle("hidden", !url);
        label.textContent = url ? "Replace image" : "Upload image";
      }
      pick.addEventListener("click", function () { file.click(); });
      remove.addEventListener("click", function () { set(""); });
      file.addEventListener("change", function () {
        var f = file.files && file.files[0];
        if (!f) return;
        pick.disabled = true;
        err.classList.add("hidden");
        label.textContent = "Uploading…";
        window.britechUpload(f).then(set).catch(function (e) {
          err.textContent = e.message;
          err.classList.remove("hidden");
          label.textContent = value.value ? "Replace image" : "Upload image";
        }).then(function () {
          pick.disabled = false;
          file.value = "";
        });
      });
    });

    /* ---------------------------- confirmations ---------------------------- */
    document.querySelectorAll("[data-confirm]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        if (!window.confirm(btn.getAttribute("data-confirm"))) e.preventDefault();
      });
    });
    document.querySelectorAll("form[data-confirm-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        if (!window.confirm(form.getAttribute("data-confirm-form"))) e.preventDefault();
      });
    });

    /* --------------------------- post title → slug -------------------------- */
    var title = document.querySelector("[data-title]");
    var slug = document.querySelector("[data-slug]");
    var preview = document.querySelector("[data-slug-preview]");
    if (title && slug) {
      var touched = slug.getAttribute("data-touched") === "1" || slug.value !== "";
      var show = function () { if (preview) preview.textContent = slug.value || "…"; };
      title.addEventListener("input", function () {
        if (!touched) { slug.value = window.britechSlugify(title.value); show(); }
      });
      slug.addEventListener("input", function () {
        touched = true;
        slug.value = window.britechSlugify(slug.value);
        show();
      });
    }

    /* ------------------------- SMTP security → port ------------------------- */
    var secure = document.querySelector("[data-smtp-secure]");
    var port = document.querySelector("[data-smtp-port]");
    if (secure && port) {
      secure.addEventListener("change", function () { port.value = secure.value === "true" ? "465" : "587"; });
    }

    /* ---------------- disable submit buttons while the form is sent ---------------- */
    document.querySelectorAll("form[data-pending-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        if (e.defaultPrevented) return;
        // Let the clicked button's name/value (e.g. intent=publish) be sent first.
        setTimeout(function () {
          form.querySelectorAll('button[type="submit"]').forEach(function (b) { b.disabled = true; });
        }, 0);
      });
    });
  });
})();
