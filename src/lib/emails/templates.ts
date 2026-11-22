export type RenderedEmail = { html: string; text: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function collapseWhitespace(value: string): string {
  return value.replace(/[ \t\r\n\f​]+/g, " ");
}

function greetingFor(firstName: string | null | undefined): string {
  return firstName?.trim() ? `Hi ${firstName.trim()},` : "Hey,";
}

function setsLabel(n: number): string {
  return `${n} ${n === 1 ? "set" : "sets"}`;
}

const TABLE = `<table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"`;
const TEXT_RESET = "margin:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0";
const BODY_TEXT = "font-size:16px;line-height:24px;color:rgb(10,10,10)";
const SMALL_MUTED = "font-size:12px;line-height:20px;color:rgb(90,90,90)";
const LINK_STYLE = `style="color:rgb(90,90,90);text-decoration-line:underline" target="_blank"`;
const HR_STYLE =
  "width:100%;border:none;border-top:1px solid #eaeaea;border-color:rgb(229,229,229);border-style:solid";
const TEXT_HR = "-".repeat(40);

const PREVIEW_MAX_LENGTH = 150;
const PREVIEW_PADDING = " ‌​‍‎‏﻿";

function previewHtml(preview: string): string {
  const text = preview.substring(0, PREVIEW_MAX_LENGTH);
  const padding =
    text.length < PREVIEW_MAX_LENGTH
      ? `<div>${PREVIEW_PADDING.repeat(PREVIEW_MAX_LENGTH - text.length)}</div>`
      : "";
  return `<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">${escapeHtml(text)}${padding}</div>`;
}

function layoutHtml({
  preview,
  content,
}: {
  preview: string;
  content: string;
}): string {
  return (
    `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">` +
    `<html dir="ltr" lang="en"><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/><meta name="x-apple-disable-message-reformatting"/><style></style></head>` +
    `<body style="background-color:rgb(255,255,255)"><!--$--><!--html--><!--head--><!--body-->` +
    `<table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center"><tbody><tr>` +
    `<td style="background-color:rgb(255,255,255);font-family:ui-sans-serif,system-ui,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;,&quot;Segoe UI Symbol&quot;,&quot;Noto Color Emoji&quot;;color:rgb(10,10,10)">` +
    previewHtml(preview) +
    `${TABLE} style="max-width:560px;margin-right:auto;margin-left:auto;padding-right:24px;padding-left:24px;padding-bottom:40px;padding-top:40px"><tbody><tr style="width:100%"><td>` +
    `${TABLE}><tbody><tr><td><p style="font-size:16px;line-height:24px;font-weight:700;letter-spacing:-0.025em;${TEXT_RESET}"><span style="color:#fb923c">Shot</span>Studio</p></td></tr></tbody></table>` +
    content +
    `</td></tr></tbody></table></td></tr></tbody></table><!--/$--></body></html>`
  );
}

function introHtml({
  heading,
  greeting,
  paragraph,
}: {
  heading: string;
  greeting: string;
  paragraph: string;
}): string {
  return (
    `${TABLE} style="margin-top:32px"><tbody><tr><td>` +
    `<h1 style="font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.025em;margin:0">${heading}</h1>` +
    `<p style="${BODY_TEXT};margin-top:16px;margin-bottom:0">${escapeHtml(greeting)}</p>` +
    `<p style="${BODY_TEXT};margin-top:12px;margin-bottom:0">${paragraph}</p>` +
    `</td></tr></tbody></table>`
  );
}

function buttonHtml(appUrl: string): string {
  return (
    `${TABLE} style="margin-top:32px"><tbody><tr><td>` +
    `<a href="${escapeHtml(`${appUrl}/home`)}" style="line-height:20px;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;background-color:rgb(17,17,17);color:rgb(255,255,255);padding-right:20px;padding-left:20px;padding-bottom:12px;padding-top:12px;border-radius:0.375rem;font-size:14px;font-weight:500;text-decoration-line:none;box-sizing:border-box" target="_blank">` +
    `<span><!--[if mso]><i style="mso-font-width:500%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]--></span>` +
    `<span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Open ShotStudio</span>` +
    `<span><!--[if mso]><i style="mso-font-width:500%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span>` +
    `</a></td></tr></tbody></table>`
  );
}

function linkHtml({ href, label }: { href: string; label: string }): string {
  return `<a href="${escapeHtml(href)}" ${LINK_STYLE}>${label}</a>`;
}

function footerHtml({
  appUrl,
  legal,
}: {
  appUrl: string;
  legal: string;
}): string {
  return (
    `<hr style="${HR_STYLE};margin-bottom:32px;margin-top:32px"/>` +
    `${TABLE}><tbody><tr><td>` +
    `<p style="${SMALL_MUTED};${TEXT_RESET}">${legal}</p>` +
    `<p style="${SMALL_MUTED};margin-top:12px;margin-bottom:0">${linkHtml({ href: appUrl, label: "shotstudio.dev" })} <!-- -->— App Store screenshots, in a minute.</p>` +
    `<p style="${SMALL_MUTED};margin-top:4px;margin-bottom:0">© 2026 ShotStudio</p>` +
    `</td></tr></tbody></table>`
  );
}

function footerText({
  appUrl,
  legal,
}: {
  appUrl: string;
  legal: string;
}): string {
  return [
    TEXT_HR,
    legal,
    `shotstudio.dev ${appUrl} — App Store screenshots, in a minute.`,
    "© 2026 ShotStudio",
  ].join("\n\n");
}

export function welcomeEmail({
  firstName,
  appUrl,
}: {
  firstName?: string | null;
  appUrl: string;
}): RenderedEmail {
  const greeting = greetingFor(firstName);
  const paragraph =
    "Upload three mobile screenshots, give us your app name and tagline, and you'll have three polished App Store shots in under a minute. No subscriptions, no design tools.";

  const html = layoutHtml({
    preview: "Welcome to ShotStudio — App Store screenshots in a minute.",
    content:
      introHtml({
        heading: "Welcome to ShotStudio",
        greeting,
        paragraph: escapeHtml(paragraph),
      }) +
      buttonHtml(appUrl) +
      footerHtml({
        appUrl,
        legal: `${linkHtml({ href: `${appUrl}/terms`, label: "Terms" })} · ${linkHtml({ href: `${appUrl}/privacy`, label: "Privacy" })}`,
      }),
  });

  const text = [
    "ShotStudio\n\n\nWELCOME TO SHOTSTUDIO",
    collapseWhitespace(greeting),
    paragraph,
    `Open ShotStudio ${appUrl}/home`,
    footerText({
      appUrl,
      legal: `Terms ${appUrl}/terms · Privacy ${appUrl}/privacy`,
    }),
  ].join("\n\n");

  return { html, text };
}

export function creditsPurchasedEmail({
  firstName,
  packageName,
  creditsAdded,
  newBalance,
  amountFormatted,
  appUrl,
}: {
  firstName?: string | null;
  packageName: string;
  creditsAdded: number;
  newBalance: number;
  amountFormatted: string;
  appUrl: string;
}): RenderedEmail {
  const greeting = greetingFor(firstName);
  const added = setsLabel(creditsAdded);
  const balance = setsLabel(newBalance);

  const label = (value: string) =>
    `<p style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:0.025em;color:rgb(90,90,90);${TEXT_RESET}">${value}</p>`;
  const value = (v: string) =>
    `<p style="font-size:14px;line-height:20px;font-weight:500;color:rgb(10,10,10);margin-top:4px;margin-bottom:0">${escapeHtml(v)}</p>`;
  const row = ({
    left,
    right,
  }: {
    left: [string, string];
    right: [string, string];
  }) =>
    `${TABLE}><tbody style="width:100%"><tr style="width:100%">` +
    `<td data-id="__react-email-column">${label(left[0])}${value(left[1])}</td>` +
    `<td align="right" data-id="__react-email-column">${label(right[0])}${value(right[1])}</td>` +
    `</tr></tbody></table>`;

  const summary =
    `${TABLE} style="margin-top:32px;background-color:rgb(247,247,247);border-radius:0.5rem;padding-right:20px;padding-left:20px;padding-bottom:16px;padding-top:16px;border-style:solid;border-width:1px;border-color:rgb(229,229,229)"><tbody><tr><td>` +
    row({ left: ["Package", packageName], right: ["Amount", amountFormatted] }) +
    `<hr style="${HR_STYLE};margin-bottom:16px;margin-top:16px"/>` +
    row({ left: ["Credits added", added], right: ["New balance", balance] }) +
    `</td></tr></tbody></table>`;

  const html = layoutHtml({
    preview: `Payment confirmed — ${added} added (balance: ${newBalance}).`,
    content:
      introHtml({
        heading: "Payment confirmed",
        greeting,
        paragraph:
          "Thanks for buying credits. Your balance is updated and ready to use.",
      }) +
      summary +
      buttonHtml(appUrl) +
      footerHtml({
        appUrl,
        legal: `All sales final. See our<!-- --> ${linkHtml({ href: `${appUrl}/terms`, label: "Terms" })} <!-- -->and<!-- --> ${linkHtml({ href: `${appUrl}/privacy`, label: "Privacy Policy" })}.`,
      }),
  });

  const text = [
    "ShotStudio\n\n\nPAYMENT CONFIRMED",
    collapseWhitespace(greeting),
    "Thanks for buying credits. Your balance is updated and ready to use.",
    "Package",
    collapseWhitespace(packageName),
    "Amount",
    collapseWhitespace(amountFormatted),
    TEXT_HR,
    "Credits added",
    added,
    "New balance",
    balance,
    `Open ShotStudio ${appUrl}/home`,
    footerText({
      appUrl,
      legal: `All sales final. See our Terms ${appUrl}/terms and Privacy Policy ${appUrl}/privacy.`,
    }),
  ].join("\n\n");

  return { html, text };
}
