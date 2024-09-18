export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="absolute inset-0 flex flex-col px-10">{children}</div>;
}
