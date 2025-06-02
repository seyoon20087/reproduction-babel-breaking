import dynamic from "next/dynamic";

const Home = dynamic(() => import("../main/Home"), { ssr: false });

export default () => <Home />;
