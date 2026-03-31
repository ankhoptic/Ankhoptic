"use client";
import { Box, Flex, VStack, Text, Spacer } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

/* ─── Design tokens ─── */
export const ADMIN_THEME = {
  sidebar: "#111827",
  sidebarBorder: "rgba(255,255,255,0.08)",
  sidebarText: "rgba(255,255,255,0.70)",
  sidebarTextHover: "white",
  sidebarActive: "rgba(255,255,255,0.10)",
  sidebarActiveText: "white",
  accent: "#10b981",
  accentDark: "#059669",
  accentLight: "#d1fae5",
  bg: "#f1f5f9",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  sub: "#94a3b8",
  danger: "#ef4444",
};

/* ─── Inline SVG icons ─── */
function SvgIcon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  Home: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9",
  Orders:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 12h6 M9 16h4",
  Products: "M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m8 4l8-5M4 7l8 5",
  Customers:
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  Analytics: "M18 20V10 M12 20V4 M6 20v-6",
  Discounts: "M9 9h.01 M15 15h.01 M19.07 4.93A10 10 0 104.93 19.07 M5 19L19 5",
  "Store Appearance": "M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  Testimonials: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  Settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
};

/* ─── Nav structure ─── */
interface NavChild {
  label: string;
  href: string;
}
interface NavSection {
  section?: string;
  items: Array<{
    label: string;
    href: string;
    badge?: string;
    children?: NavChild[];
  }>;
}

const NAV: NavSection[] = [
  {
    items: [{ label: "Home", href: "/admin" }],
  },
  {
    section: "Store",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
      },
      {
        label: "Products",
        href: "/admin/products",
        children: [
          { label: "All products", href: "/admin/products" },
          { label: "Add product", href: "/admin/products/new" },
          { label: "Categories", href: "/admin/categories" },
          { label: "Brands", href: "/admin/brands" },
          { label: "Aftercare Add-ons", href: "/admin/aftercare-addons" },
          { label: "Inventory", href: "/admin/inventory" },
        ],
      },
      { label: "Customers", href: "/admin/customers" },
      { label: "Analytics", href: "/admin/analytics" },
      { label: "Store Appearance", href: "/admin/marketing/store-settings" },
      { label: "Discounts", href: "/admin/discounts" },
      { label: "Product Reviews", href: "/admin/reviews" },
    ],
  },
  {
    section: "Account",
    items: [{ label: "Settings", href: "/admin/settings" }],
  },
];

/* ─── Nav item ─── */
function NavItem({
  label,
  href,
  badge,
  children,
  onNavigate,
}: {
  label: string;
  href: string;
  badge?: string;
  children?: NavChild[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/admin" && pathname.startsWith(href));
  const [open, setOpen] = useState(isActive);
  const hasChildren = !!children?.length;
  const iconPath = ICONS[label] ?? ICONS.Home;

  const rowStyles = {
    align: "center" as const,
    gap: 2.5,
    px: 3,
    py: "9px",
    bg: isActive ? ADMIN_THEME.sidebarActive : "transparent",
    color: isActive ? ADMIN_THEME.sidebarActiveText : ADMIN_THEME.sidebarText,
    _hover: { bg: ADMIN_THEME.sidebarActive, color: "white" },
    transition: "all 0.12s",
    cursor: "pointer",
    borderLeft: "2px solid",
    borderColor: isActive ? ADMIN_THEME.accent : "transparent",
  };

  const inner = (
    <>
      <Box color={isActive ? ADMIN_THEME.accent : "inherit"} flexShrink={0}>
        <SvgIcon d={iconPath} size={16} />
      </Box>

      <Text fontSize="13.5px" fontWeight={isActive ? 600 : 400} flex={1} textAlign="left">
        {label}
      </Text>

      {badge && (
        <Box
          bg="rgba(255,255,255,0.12)"
          color="rgba(255,255,255,0.85)"
          fontSize="10px"
          fontWeight={700}
          px={1.5}
          py="1px"
          borderRadius="full"
          minW="20px"
          textAlign="center"
        >
          {badge}
        </Box>
      )}

      {hasChildren && (
        <Box
          as="span"
          fontSize="10px"
          color="rgba(255,255,255,0.3)"
          ml={0.5}
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          ▸
        </Box>
      )}
    </>
  );

  return (
    <Box w="full">
      {hasChildren ? (
        <Flex as="button" w="full" {...rowStyles} onClick={() => setOpen((o) => !o)}>
          {inner}
        </Flex>
      ) : (
        <NextLink href={href} style={{ width: "100%", textDecoration: "none" }} onClick={onNavigate}>
          <Flex {...rowStyles}>{inner}</Flex>
        </NextLink>
      )}

      {hasChildren && open && (
        <Box borderLeft="2px solid rgba(255,255,255,0.10)" ml="28px" my={0.5}>
          {children!.map((c) => {
            const active = pathname === c.href;
            return (
              <NextLink key={c.href} href={c.href} style={{ textDecoration: "none" }} onClick={onNavigate}>
                <Flex
                  align="center"
                  px={3}
                  py="7px"
                  color={active ? "white" : "rgba(255,255,255,0.65)"}
                  _hover={{ color: "white", bg: "rgba(255,255,255,0.05)" }}
                  borderRadius="6px"
                  transition="all 0.1s"
                  cursor="pointer"
                >
                  <Box
                    w="5px"
                    h="5px"
                    borderRadius="full"
                    mr={2.5}
                    flexShrink={0}
                    bg={active ? ADMIN_THEME.accent : "rgba(255,255,255,0.2)"}
                  />
                  <Text fontSize="13px" fontWeight={active ? 600 : 400} lineHeight={1.4}>
                    {c.label}
                  </Text>
                </Flex>
              </NextLink>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/* ─── Sidebar user footer ─── */
function SidebarUserFooter() {
  const { data: session } = useSession();
  const name = (session?.user as { name?: string })?.name ?? "Admin";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Flex direction="column" gap={2}>
      <Flex align="center" gap={2.5}>
        <Flex
          w="28px" h="28px" borderRadius="full"
          bg={ADMIN_THEME.accent} align="center" justify="center"
          color="white" fontSize="11px" fontWeight={700} flexShrink={0}
        >
          {initials}
        </Flex>
        <Box overflow="hidden">
          <Text fontSize="12.5px" fontWeight={600} color="white" lineHeight={1.3} truncate>
            {name}
          </Text>
          <Text fontSize="10.5px" color="rgba(255,255,255,0.35)" lineHeight={1.4}>
            Admin
          </Text>
        </Box>
      </Flex>

      <Box
        as="button"
        w="full"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        display="flex"
        alignItems="center"
        gap="8px"
        px="10px"
        py="7px"
        borderRadius="7px"
        fontSize="12.5px"
        fontWeight={500}
        color="rgba(255,255,255,0.5)"
        bg="transparent"
        border="1px solid rgba(255,255,255,0.08)"
        cursor="pointer"
        _hover={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.35)", bg: "rgba(239,68,68,0.06)" }}
        transition="all 0.15s"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </Box>
    </Flex>
  );
}

/* ─── Sidebar content (shared between desktop + mobile) ─── */
function SidebarContent({
  onNavigate,
  ordersBadge,
}: {
  onNavigate?: () => void;
  ordersBadge?: string;
}) {
  return (
    <>
      {/* Logo */}
      <Flex
        align="center" gap={3} px={4} py={4}
        borderBottom={`1px solid ${ADMIN_THEME.sidebarBorder}`}
        flexShrink={0}
      >
        <Flex
          w="32px" h="32px" borderRadius="8px"
          bg={ADMIN_THEME.accent} align="center" justify="center"
          fontWeight={800} fontSize="15px" color="white" flexShrink={0}
        >
          A
        </Flex>
        <Box>
          <Text fontSize="14px" fontWeight={700} color="white" lineHeight={1.2}>
            Ankhoptics
          </Text>
          <Text fontSize="10.5px" color="rgba(255,255,255,0.35)" lineHeight={1.5}>
            Admin Panel
          </Text>
        </Box>
      </Flex>

      {/* Nav */}
      <VStack gap={0} py={3} align="stretch" flex={1} overflowY="auto"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        {NAV.map((section, si) => (
          <Box key={si} mb={si < NAV.length - 1 ? 2 : 0}>
            {section.section && (
              <Text
                px={4} pt={4} pb={1.5}
                fontSize="10px" fontWeight={700}
                color="rgba(255,255,255,0.2)"
                textTransform="uppercase" letterSpacing="1px" display="block"
              >
                {section.section}
              </Text>
            )}
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                badge={item.label === "Orders" && ordersBadge ? ordersBadge : item.badge}
                onNavigate={onNavigate}
              />
            ))}
          </Box>
        ))}
      </VStack>

      {/* Footer */}
      <Box
        borderTop={`1px solid ${ADMIN_THEME.sidebarBorder}`}
        px={4} pt={3} pb={3} flexShrink={0}
      >
        <SidebarUserFooter />
      </Box>
    </>
  );
}

/* ─── Main Layout ─── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unfulfilledCount, setUnfulfilledCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error && typeof d.unfulfilled === "number") {
          setUnfulfilledCount(d.unfulfilled);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Flex h="100vh" overflow="hidden" bg={ADMIN_THEME.bg}>

      {/* ════ DESKTOP SIDEBAR (hidden on mobile) ════ */}
      <Box
        w="200px"
        minH="100vh"
        bg={ADMIN_THEME.sidebar}
        position="fixed"
        left={0} top={0} bottom={0}
        display={{ base: "none", lg: "flex" }}
        flexDirection="column"
        zIndex={50}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        <SidebarContent ordersBadge={unfulfilledCount !== null && unfulfilledCount > 0 ? String(unfulfilledCount) : undefined} />
      </Box>

      {/* ════ MOBILE SIDEBAR OVERLAY ════ */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed" inset={0} zIndex={90}
            bg="rgba(0,0,0,0.5)"
            backdropFilter="blur(2px)"
            display={{ base: "block", lg: "none" }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <Box
            position="fixed" left={0} top={0} bottom={0}
            w="220px"
            bg={ADMIN_THEME.sidebar}
            zIndex={100}
            display={{ base: "flex", lg: "none" }}
            flexDirection="column"
            boxShadow="4px 0 24px rgba(0,0,0,0.3)"
          >
            {/* Close button */}
            <Box
              as="button"
              position="absolute" top="12px" right="12px"
              color="rgba(255,255,255,0.5)"
              _hover={{ color: "white" }}
              cursor="pointer"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </Box>
            <SidebarContent onNavigate={() => setMobileOpen(false)} ordersBadge={unfulfilledCount !== null && unfulfilledCount > 0 ? String(unfulfilledCount) : undefined} />
          </Box>
        </>
      )}

      {/* ════ MAIN AREA ════ */}
      <Box
        flex={1}
        ml={{ base: 0, lg: "200px" }}
        display="flex"
        flexDirection="column"
        h="100vh"
        overflow="hidden"
      >
        {/* Topbar */}
        <Flex
          h="52px"
          bg="white"
          borderBottom={`1px solid ${ADMIN_THEME.border}`}
          align="center"
          px={{ base: 3, md: 6 }}
          gap={3}
          position="sticky"
          top={0}
          zIndex={40}
          shadow="0 1px 3px rgba(0,0,0,0.04)"
        >
          {/* Hamburger — mobile only */}
          <Box
            as="button"
            display={{ base: "flex", lg: "none" }}
            alignItems="center"
            justifyContent="center"
            w="34px" h="34px"
            borderRadius="8px"
            border={`1px solid ${ADMIN_THEME.border}`}
            color={ADMIN_THEME.sub}
            cursor="pointer"
            _hover={{ bg: ADMIN_THEME.bg, color: ADMIN_THEME.text }}
            flexShrink={0}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </Box>

          {/* Search */}
          <Flex
            align="center" gap={2}
            bg={ADMIN_THEME.bg}
            border={`1px solid ${ADMIN_THEME.border}`}
            borderRadius="8px"
            px={3} h="34px"
            maxW={{ base: "100%", md: "380px" }}
            flex={1}
            cursor="text"
          >
            <Box color={ADMIN_THEME.sub} flexShrink={0}>
              <Search size={14} strokeWidth={2} />
            </Box>
            <Text fontSize="13px" color={ADMIN_THEME.sub} userSelect="none" flex={1} truncate>
              Search products, orders, customers...
            </Text>
            <Box
              border={`1px solid ${ADMIN_THEME.border}`}
              borderRadius="4px" px={1.5} py={0.5}
              display={{ base: "none", sm: "block" }}
            >
              <Text fontSize="10px" color="#c1c4c7" lineHeight={1}>⌘K</Text>
            </Box>
          </Flex>

          <Spacer />

          {/* User */}
          <NextLink href="/admin/settings" style={{ textDecoration: "none" }}>
            <Flex align="center" gap={2.5} cursor="pointer">
              <Flex
                w="30px" h="30px" borderRadius="full"
                bg={ADMIN_THEME.accent} align="center" justify="center"
                color="white" fontSize="11px" fontWeight={700}
                flexShrink={0}
              >
                HA
              </Flex>
              <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="13px" fontWeight={600} color={ADMIN_THEME.text} lineHeight={1.2}>
                  Hambal Ahmed
                </Text>
                <Text fontSize="11px" color={ADMIN_THEME.sub} lineHeight={1.4}>
                  Administrator
                </Text>
              </Box>
            </Flex>
          </NextLink>
        </Flex>

        {/* Page content */}
        <Box flex={1} overflowY="auto">
          <div className="admin-page-transition">{children}</div>
        </Box>
      </Box>
    </Flex>
  );
}
