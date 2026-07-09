export default function Container({children,}: {children:React.ReactNode}) {
  return (
    <div className="mt-10">
      {children}
    </div>
  );
}
