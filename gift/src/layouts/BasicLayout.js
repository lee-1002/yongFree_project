import { Link, Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";
import SideMenu from "../components/menus/SideMenu"; // SideMenu를 BasicLayout에서 직접 임포트
import { SearchProvider } from "../context/SearchContext";

const BasicLayout = () => {
  return (
    <SearchProvider>
      <div className="container mx-auto">
        {/* 또는 gap-x-0.5 등으로 줄이기 (조금 떨어짐) */}
        <div className="grid grid-cols-10 gap-x-2">
          {" "}
          {/* BasicMenu 영역 */}
          <div className="col-span-10 md:col-span-8 md:col-start-2">
            <BasicMenu />
          </div>
          {/* 메인 콘텐츠 영역 */}
          <main className="col-span-10 md:col-span-8 md:col-start-2 py-5">
            <Outlet />
          </main>
          {/* SideMenu 영역 */}
          <aside className="col-span-2 md:block md:sticky md:top-5 md:self-start">
            <SideMenu />
          </aside>
        </div>
      </div>
      {/* 3. footer를 container 밖으로 이동시킵니다. */}
      <footer className="w-full bg-gray-800 text-gray-300 py-8 text-sm mt-10">
        <div className="container mx-auto text-center">
          <p className="font-bold text-lg text-white mb-2">Gifree</p>
          <div className="flex justify-center space-x-6 mb-4">
            <Link to="/terms" className="hover:text-white">
              이용약관
            </Link>
            <Link to="/privacy" className="hover:text-white">
              개인정보처리방침
            </Link>
            <Link to="/contact" className="hover:text-white">
              고객센터
            </Link>
          </div>
          <p>
            기프리 주식회사 | 대표: 코딩파트너 | 사업자등록번호: 123-45-67890
          </p>
          <p>주소: 서울특별시 어딘가 | 이메일: contact@gifree.com</p>
          <p className="mt-4 text-gray-500">
            © 2025 Gifree Inc. All Rights Reserved.
          </p>
        </div>
      </footer>
    </SearchProvider>
  );
};

export default BasicLayout;
