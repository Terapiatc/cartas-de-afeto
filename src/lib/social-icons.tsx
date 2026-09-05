import {
  Instagram,
  MessageCircle,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Github,
  Globe,
  Mail,
  Phone,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";

export type SocialIconEntry = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

export const SOCIAL_ICONS: SocialIconEntry[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "twitter", label: "Twitter / X", Icon: Twitter },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "github", label: "GitHub", Icon: Github },
  { key: "globe", label: "Site", Icon: Globe },
  { key: "email", label: "E-mail", Icon: Mail },
  { key: "phone", label: "Telefone", Icon: Phone },
  { key: "link", label: "Link genérico", Icon: LinkIcon },
];

const ICON_MAP = new Map(SOCIAL_ICONS.map((e) => [e.key, e.Icon]));

export function getSocialIcon(key: string): LucideIcon {
  return ICON_MAP.get(key) ?? LinkIcon;
}
