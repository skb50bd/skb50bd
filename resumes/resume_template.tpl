<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$title$</title>
<style>
@page {
  size: A4;
  margin: 10mm 12mm 10mm 12mm;
}
* {
  box-sizing: border-box;
}
html, body {
  margin: 0;
  padding: 0;
  font-family: "Liberation Sans", "Arial", sans-serif;
  font-size: 8.8pt;
  line-height: 1.2;
  color: #111;
  background: #fff;
}
h1 {
  font-size: 16pt;
  font-weight: 700;
  margin: 0 0 1pt 0;
  letter-spacing: -0.3pt;
  color: #000;
}
h2 {
  font-size: 9.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6pt;
  margin: 7pt 0 2.5pt 0;
  padding-bottom: 1pt;
  border-bottom: 0.7pt solid #111;
  color: #000;
}
h3 {
  font-size: 9.2pt;
  font-weight: 700;
  margin: 4pt 0 0.5pt 0;
  color: #000;
}
p {
  margin: 0 0 2.5pt 0;
}
.header {
  margin-bottom: 4pt;
}
.header-line {
  font-size: 8.2pt;
  color: #333;
  margin: 0.5pt 0;
}
.header-line strong {
  color: #000;
}
a {
  color: #000;
  text-decoration: none;
}
ul, ol {
  margin: 1.5pt 0 3pt 0;
  padding-left: 0;
  list-style: none;
}
li {
  margin-bottom: 0.5pt;
  padding-left: 10pt;
  text-indent: -10pt;
}
ul > li::before {
  content: "• ";
}
ol {
  counter-reset: pub-counter;
}
ol > li {
  counter-increment: pub-counter;
}
ol > li::before {
  content: counter(pub-counter) ". ";
}
li > ul, li > ol {
  margin-top: 0.5pt;
  margin-bottom: 2pt;
  padding-left: 0;
}
li > ul > li {
  padding-left: 14pt;
  text-indent: -10pt;
}
li > ul > li::before {
  content: "◦ ";
}
.role-meta {
  font-size: 8pt;
  color: #444;
  font-style: italic;
  margin: 0 0 1.5pt 0;
}
.section-sub {
  font-size: 8.5pt;
  color: #222;
  margin: 0.5pt 0 2pt 0;
}
.skill-row {
  margin-bottom: 1.5pt;
}
.skill-label {
  font-weight: 700;
}
.project-stack {
  font-size: 8pt;
  color: #333;
  font-style: italic;
}
.publication {
  margin-bottom: 2.5pt;
}
.publication-title {
  font-weight: 700;
}
.publication-meta {
  font-size: 8pt;
  color: #333;
}
.no-break {
  break-inside: avoid;
}
</style>
</head>
<body>
$body$
</body>
</html>
