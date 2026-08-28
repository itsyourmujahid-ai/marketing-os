import type { IconName } from "@/components/ui/icon";

export interface Accent {
  text: string;
  bg: string;
  border: string;
  ring: string;
  gradient: string;
  glow: string;
  dot: string;
}

export interface Tool {
  id?: string;
  name: string;
  description: string;
  icon: IconName;
}

export interface Section {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  icon: IconName;
  accent: Accent;
  tools: Tool[];
}

const amber: Accent = {
  text: "text-amber-300",
  bg: "bg-amber-500/10",
  border: "border-amber-400/25",
  ring: "ring-amber-400/30",
  gradient: "from-amber-400 to-yellow-500",
  glow: "shadow-amber-500/15",
  dot: "bg-amber-400",
};

const sky: Accent = {
  text: "text-sky-300",
  bg: "bg-sky-500/10",
  border: "border-sky-400/25",
  ring: "ring-sky-400/30",
  gradient: "from-sky-400 to-cyan-500",
  glow: "shadow-sky-500/15",
  dot: "bg-sky-400",
};

const violet: Accent = {
  text: "text-violet-300",
  bg: "bg-violet-500/10",
  border: "border-violet-400/25",
  ring: "ring-violet-400/30",
  gradient: "from-violet-400 to-purple-500",
  glow: "shadow-violet-500/15",
  dot: "bg-violet-400",
};

const rose: Accent = {
  text: "text-rose-300",
  bg: "bg-rose-500/10",
  border: "border-rose-400/25",
  ring: "ring-rose-400/30",
  gradient: "from-rose-400 to-pink-500",
  glow: "shadow-rose-500/15",
  dot: "bg-rose-400",
};

const emerald: Accent = {
  text: "text-emerald-300",
  bg: "bg-emerald-500/10",
  border: "border-emerald-400/25",
  ring: "ring-emerald-400/30",
  gradient: "from-emerald-400 to-teal-500",
  glow: "shadow-emerald-500/15",
  dot: "bg-emerald-400",
};

const orange: Accent = {
  text: "text-orange-300",
  bg: "bg-orange-500/10",
  border: "border-orange-400/25",
  ring: "ring-orange-400/30",
  gradient: "from-orange-400 to-amber-500",
  glow: "shadow-orange-500/15",
  dot: "bg-orange-400",
};

const indigo: Accent = {
  text: "text-indigo-300",
  bg: "bg-indigo-500/10",
  border: "border-indigo-400/25",
  ring: "ring-indigo-400/30",
  gradient: "from-indigo-400 to-blue-500",
  glow: "shadow-indigo-500/15",
  dot: "bg-indigo-400",
};

const teal: Accent = {
  text: "text-teal-300",
  bg: "bg-teal-500/10",
  border: "border-teal-400/25",
  ring: "ring-teal-400/30",
  gradient: "from-teal-400 to-emerald-500",
  glow: "shadow-teal-500/15",
  dot: "bg-teal-400",
};

const blue: Accent = {
  text: "text-blue-300",
  bg: "bg-blue-500/10",
  border: "border-blue-400/25",
  ring: "ring-blue-400/30",
  gradient: "from-blue-400 to-sky-500",
  glow: "shadow-blue-500/15",
  dot: "bg-blue-400",
};

const red: Accent = {
  text: "text-red-300",
  bg: "bg-red-500/10",
  border: "border-red-400/25",
  ring: "ring-red-400/30",
  gradient: "from-red-400 to-rose-500",
  glow: "shadow-red-500/15",
  dot: "bg-red-400",
};

const fuchsia: Accent = {
  text: "text-fuchsia-300",
  bg: "bg-fuchsia-500/10",
  border: "border-fuchsia-400/25",
  ring: "ring-fuchsia-400/30",
  gradient: "from-fuchsia-400 to-pink-500",
  glow: "shadow-fuchsia-500/15",
  dot: "bg-fuchsia-400",
};

export const sections: Section[] = [
  {
    slug: "image-lab",
    name: "Image Lab",
    short: "Image Lab",
    tagline: "Edit, fix and optimise images.",
    description:
      "Remove backgrounds, upscale to 4K, enhance details and prepare images for any screen or print job.",
    icon: "image",
    accent: sky,
    tools: [
      {
        id: "bg-remove",
        name: "BG Remove",
        description: "Strip the background from any photo in one click.",
        icon: "scissors",
      },
      {
        id: "upscale-4k",
        name: "4K Upscale",
        description: "Blow images up to crisp 4K quality.",
        icon: "expand",
      },
      {
        id: "enhance",
        name: "Enhance",
        description: "Boost colour, light and detail automatically.",
        icon: "sparkles",
      },
      {
        id: "sharpen",
        name: "Sharpen",
        description: "Bring back crisp edges and fine texture.",
        icon: "sliders",
      },
      {
        id: "resize",
        name: "Resize",
        description: "Scale to exact pixel widths and heights.",
        icon: "resize",
      },
      {
        id: "crop",
        name: "Crop",
        description: "Trim to a perfect composition in seconds.",
        icon: "crop",
      },
      {
        id: "compress",
        name: "Compress",
        description: "Shrink file size without losing visible quality.",
        icon: "archive",
      },
      {
        id: "format-convert",
        name: "Format Convert",
        description: "Convert between PNG, JPG, WebP and more.",
        icon: "repeat",
      },
      {
        id: "background-change",
        name: "Background Change",
        description: "Swap in a solid, gradient or custom backdrop.",
        icon: "layers",
      },
    ],
  },
  {
    slug: "icon-khajana",
    name: "Icon Khajana",
    short: "Icon Khajana",
    tagline: "A treasure chest of icons.",
    description:
      "Search, browse and edit a growing library of premium SVG and PNG icons for every interface.",
    icon: "gem",
    accent: violet,
    tools: [
      {
        name: "Icon Search",
        description: "Find the perfect icon by keyword in an instant.",
        icon: "search",
      },
      {
        name: "Categories",
        description: "Browse icons grouped by topic and style.",
        icon: "grid",
      },
      {
        name: "SVG Icons",
        description: "Copy clean, scalable SVG mark-up any time.",
        icon: "code",
      },
      {
        name: "PNG Icons",
        description: "Export raster icons at every pixel density.",
        icon: "image",
      },
      {
        name: "Icon Editor",
        description: "Edit stroke, weight, colour and size live.",
        icon: "pen",
      },
    ],
  },
  {
    slug: "colour-studio",
    name: "Colour Studio",
    short: "Colour Studio",
    tagline: "Pick, mix and harmonise colour.",
    description:
      "Professional colour tools for picking palettes, building gradients and checking accessible contrast.",
    icon: "palette",
    accent: rose,
    tools: [
      {
        name: "Colour Picker",
        description: "Pick HEX, RGB and HSL values from anywhere.",
        icon: "pipette",
      },
      {
        name: "Palette Generator",
        description: "Generate balanced colour palettes instantly.",
        icon: "palette",
      },
      {
        name: "Gradient Generator",
        description: "Craft smooth linear and radial gradients.",
        icon: "gradient",
      },
      {
        name: "Contrast Checker",
        description: "Verify WCAG contrast ratios at a glance.",
        icon: "contrast",
      },
      {
        name: "Colour Harmony",
        description: "Discover complementary and analogous schemes.",
        icon: "harmony",
      },
      {
        name: "Colour Converter",
        description: "Convert between every colour model in one step.",
        icon: "arrows",
      },
    ],
  },
  {
    slug: "typography-studio",
    name: "Typography Studio",
    short: "Typography",
    tagline: "Type that looks effortless.",
    description:
      "Rules, pairings and scales that make any interface read beautifully — no design degree required.",
    icon: "type",
    accent: emerald,
    tools: [
      {
        name: "Typography Rules",
        description: "The essential do's and don'ts of type.",
        icon: "list",
      },
      {
        name: "Font Pairing",
        description: "Match complementary fonts with confidence.",
        icon: "link",
      },
      {
        name: "Type Scale",
        description: "Build harmonious modular type scales.",
        icon: "scale",
      },
      {
        name: "Hierarchy",
        description: "Structure content from headline to caption.",
        icon: "type",
      },
      {
        name: "Line Height",
        description: "Dial in rhythm for any font size.",
        icon: "height",
      },
      {
        name: "Letter Spacing",
        description: "Fine-tune tracking for impact and legibility.",
        icon: "spacing",
      },
    ],
  },
  {
    slug: "text-studio",
    name: "Text Studio",
    short: "Text Studio",
    tagline: "Write copy that converts.",
    description:
      "Generate and rewrite on-brand copy — from headlines to CTAs — in professional, premium or catchy tones.",
    icon: "pen",
    accent: orange,
    tools: [
      {
        name: "Text Hierarchy",
        description: "Build a clear structure for your message.",
        icon: "heading",
      },
      {
        name: "Heading",
        description: "Craft scroll-stopping heading copy.",
        icon: "subtitle",
      },
      {
        name: "Subheading",
        description: "Support headlines with sharp subheads.",
        icon: "paragraph",
      },
      {
        name: "Body",
        description: "Write clear, scannable body copy.",
        icon: "list",
      },
      {
        name: "CTA",
        description: "Create action buttons people want to press.",
        icon: "cursor",
      },
      {
        name: "Rewrite",
        description: "Reframe existing text with a fresh angle.",
        icon: "refresh",
      },
      {
        name: "Shorten",
        description: "Cut copy down to its powerful minimum.",
        icon: "shrink",
      },
      {
        name: "Professional",
        description: "Polish text into precise, credible tone.",
        icon: "briefcase",
      },
      {
        name: "Premium",
        description: "Elevate copy into luxurious, high-end voice.",
        icon: "crown",
      },
      {
        name: "Corporate",
        description: "Shape compliant, buttoned-up business tone.",
        icon: "building",
      },
      {
        name: "Catchy",
        description: "Turn plain copy into something memorable.",
        icon: "zap",
      },
    ],
  },
  {
    slug: "design-size-layout",
    name: "Design Size & Layout",
    short: "Size & Layout",
    tagline: "Right canvas, every time.",
    description:
      "Instant canvas presets for social media, print and custom work — with perfect aspect ratios built in.",
    icon: "rectangle",
    accent: indigo,
    tools: [
      {
        name: "Social Media Sizes",
        description: "Exact canvas presets for every platform.",
        icon: "share",
      },
      {
        name: "Print Sizes",
        description: "Standard print dimensions at a glance.",
        icon: "printer",
      },
      {
        name: "Custom Canvas",
        description: "Start with any width, height and DPI.",
        icon: "rectangle",
      },
      {
        name: "Ratios",
        description: "Crop-ready aspect ratios for any format.",
        icon: "frame",
      },
    ],
  },
  {
    slug: "print-studio",
    name: "Print Studio",
    short: "Print Studio",
    tagline: "Flawless print, every time.",
    description:
      "Everything needed to prep files for print — resolution, colour mode, bleed and safe areas included.",
    icon: "printer",
    accent: teal,
    tools: [
      {
        name: "DPI Calculator",
        description: "Work out resolution for any print size.",
        icon: "calculator",
      },
      {
        name: "RGB/CMYK",
        description: "Understand and convert colour modes.",
        icon: "spectrum",
      },
      {
        name: "Bleed",
        description: "Set print bleed correctly with guides.",
        icon: "scan",
      },
      {
        name: "Safe Area",
        description: "Keep critical content inside the safe zone.",
        icon: "shield",
      },
      {
        name: "Unit Converter",
        description: "Switch between mm, cm, inches and pixels.",
        icon: "ruler",
      },
      {
        name: "Print Resolution",
        description: "Check the right DPI for every print job.",
        icon: "gauge",
      },
    ],
  },
  {
    slug: "inspector",
    name: "Inspector",
    short: "Inspector",
    tagline: "Know every file inside out.",
    description:
      "Drop in any image and inspect resolution, DPI, colour mode and print readiness in a heartbeat.",
    icon: "inspect",
    accent: blue,
    tools: [
      {
        name: "Image Inspector",
        description: "A full breakdown of any image file.",
        icon: "inspect",
      },
      {
        name: "Resolution",
        description: "Dimensions, megapixels and usage intent.",
        icon: "expand",
      },
      {
        name: "DPI",
        description: "True dots-per-inch for screen and print.",
        icon: "zoom",
      },
      {
        name: "File Info",
        description: "Metadata, size, type and export origin.",
        icon: "file",
      },
      {
        name: "Colour Mode",
        description: "RGB, CMYK and bit-depth at a glance.",
        icon: "droplet",
      },
      {
        name: "Print Check",
        description: "Instantly validate a file for print.",
        icon: "badgeCheck",
      },
    ],
  },
  {
    slug: "design-doctor",
    name: "Design Doctor",
    short: "Design Doctor",
    tagline: "A health check for your design.",
    description:
      "Run an automated audit across typography, colour, contrast and composition — then auto-fix the issues.",
    icon: "badgeCheck",
    accent: red,
    tools: [
      {
        name: "Design Checker",
        description: "Full health check with a clear score.",
        icon: "clipboard",
      },
      {
        name: "Typography Check",
        description: "Catch awkward sizes, weights and spacing.",
        icon: "type",
      },
      {
        name: "Colour Check",
        description: "Spot weak or inconsistent colour choices.",
        icon: "droplet",
      },
      {
        name: "Contrast Check",
        description: "Verify readability against WCAG levels.",
        icon: "contrast",
      },
      {
        name: "Spacing",
        description: "Find uneven rhythm in your layout.",
        icon: "spacing",
      },
      {
        name: "Alignment",
        description: "Detect misaligned elements instantly.",
        icon: "align",
      },
      {
        name: "Composition",
        description: "Audit balance, flow and focal points.",
        icon: "layout",
      },
      {
        name: "Auto Fix",
        description: "Apply one-tap fixes to flagged issues.",
        icon: "wrench",
      },
    ],
  },
  {
    slug: "grid-khajana",
    name: "Grid Khajana",
    short: "Grid Khajana",
    tagline: "Layouts that just click.",
    description:
      "Featured grid systems, ratio guides and a growing reference library for pixel-perfect layouts.",
    icon: "grid",
    accent: fuchsia,
    tools: [
      {
        name: "Featured Grids",
        description: "Curated grid systems for every layout.",
        icon: "star",
      },
      {
        name: "Ratio",
        description: "Golden ratios and spacing multipliers.",
        icon: "frame",
      },
      {
        name: "Grid Library",
        description: "A growing library of reusable grids.",
        icon: "grid",
      },
      {
        name: "References",
        description: "Real-world layouts to learn from.",
        icon: "book",
      },
      {
        name: "Show Grid",
        description: "Preview any grid over your canvas.",
        icon: "eye",
      },
      {
        name: "Use on Canvas",
        description: "Drop a grid straight onto the canvas.",
        icon: "corner",
      },
      {
        name: "How to Use",
        description: "Simple steps for working with grids.",
        icon: "help",
      },
    ],
  },
];

export const overview: Section = {
  slug: "overview",
  name: "Overview",
  short: "Overview",
  tagline: "Your design toolkit, all in one place.",
  description:
    "Eleven studios. Sixty-eight tools. Everything you need to design — one treasure chest.",
  icon: "gem",
  accent: amber,
  tools: [],
};

export const navItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "Overview", icon: "home" },
  ...sections.map((section) => ({
    href: `/${section.slug}`,
    label: section.name,
    icon: section.icon,
  })),
];

export function getSection(slug: string): Section | undefined {
  return sections.find((section) => section.slug === slug);
}

export const studioCount = sections.length;
export const totalTools = sections.reduce((sum, section) => sum + section.tools.length, 0);