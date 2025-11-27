import Loading from "../components/Loading";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loading text="正在載入股利日曆..." />
    </div>
  );
}