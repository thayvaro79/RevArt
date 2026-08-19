// Registry of the predefined RevArt pages the Admin Content Editor can edit,
// and which PageHero/PageSection records back each one. Section/card `key`
// values are the existing database identifiers already consumed by the
// public pages (see e.g. src/pages/Home.jsx) — they are not exposed to the
// admin, only the human-readable `label` is shown in the UI.

export const CONTENT_PAGES = {
  home: {
    label: "Home",
    publicPath: "/",
    heroPageKey: "home",
    sectionPageName: "Home",
    sections: [
      { key: "intro", label: "Who We Are", fields: ["heading", "body", "image"] },
      { key: "mission", label: "Our Mission", fields: ["heading", "body"] },
      {
        key: "accordion-ready-to-sell",
        label: "Ready to Sell",
        fields: ["heading", "body"],
      },
      {
        key: "accordion-looking-to-buy",
        label: "Looking to Buy",
        fields: ["heading", "body"],
      },
    ],
    cards: [
      {
        key: "card-garage",
        label: "The Garage Card",
        destination: "Links to The Garage",
        fields: ["heading", "image"],
      },
      {
        key: "card-instagram",
        label: "Follow Us Card",
        destination: "Links to RevArt on Instagram",
        fields: ["heading", "image"],
      },
      {
        key: "card-whoweare",
        label: "Who We Are Card",
        destination: "Links to Who We Are",
        fields: ["heading", "image"],
      },
      {
        key: "card-contact",
        label: "Contact Us Card",
        destination: "Links to Contact",
        fields: ["heading", "image"],
      },
    ],
  },

  garage: {
    label: "The Garage",
    publicPath: "/garage",
    heroPageKey: "garage",
    sectionPageName: "Garage",
    sections: [],
    cards: [],
  },

  sold: {
    label: "Sold",
    publicPath: "/sold",
    heroPageKey: "sold",
    sectionPageName: "Sold",
    sections: [],
    cards: [],
  },

  whoweare: {
    label: "Who We Are",
    publicPath: "/whoweare",
    heroPageKey: "whoweare",
    sectionPageName: "WhoWeAre",
    sections: [
      { key: "brand-story", label: "Our Story", fields: ["heading", "body"] },
    ],
    cards: [],
  },

  whatwedo: {
    label: "What We Do",
    publicPath: "/whatwedo",
    heroPageKey: "whatwedo",
    sectionPageName: "WhatWeDo",
    sections: [
      { key: "approach", label: "Our Approach", fields: ["heading", "body"] },
      { key: "commitment", label: "Our Commitment", fields: ["heading", "body"] },
    ],
    cards: [],
  },

  contact: {
    label: "Contact",
    publicPath: "/contact",
    heroPageKey: "contact",
    sectionPageName: "Contact",
    sections: [
      { key: "intro", label: "Let's Talk", fields: ["heading", "body"] },
    ],
    cards: [],
  },
};

export const CONTENT_PAGE_ORDER = [
  "home",
  "garage",
  "sold",
  "whoweare",
  "whatwedo",
  "contact",
];
