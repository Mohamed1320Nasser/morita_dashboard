import Card from "@/components/atoms/cards";
import SearchInput from "@/components/atoms/inputs/searchInput";
import Head from "@/components/molecules/head/head";
import Container from "@/components/templates/container";
import PageHead from "@/components/templates/pageHead";
import React, { useCallback, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import Table from "./categoryTable";
import category from "@/controllers/category";
import { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from "react-toastify";
import { Slide } from "react-toastify";
import { useRouter } from "next/router";

const CategoryPage = () => {
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();
  function handleRefresh() {
    setRefresh(!refresh);
  }

  const columns = [
    { title: "Title" },
    { title: "Added at" },
    { title: "Status" },
  ];

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [categoriesList, setCategoriesList] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [search, setSearch] = useState("");
  const handleSearchChange = (event) => {
    setSearch(event);
    setPage(1);
  };

  const [totalCount, setTotalCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);

  const getCategoriesData = async () => {
    try {
      const response = await category.getCategoriesList(search, limit, page);
      if (response && !response.error) {
        const DataWithItemNumber = response.data.categories.map(
          (item, index) => {
            const itemNumber = (page - 1) * limit + index + 1;
            return { ...item, itemNumber };
          }
        );
        setCategoriesList(DataWithItemNumber);
        setTotalCount(response.data.total);
        setFilterCount(response.data.filteredCount);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    getCategoriesData();
  }, [search, limit, page, refresh]);

  const handlePaginate = useCallback(
    (e = null) => {
      e.stopPropagation();

      const pageItem = e.target.closest(".MuiPaginationItem-root");
      const isPrev =
        pageItem?.getAttribute("aria-label") === "Go to previous page";
      const isNext = pageItem?.getAttribute("aria-label") === "Go to next page";

      let newPage;
      if (isPrev && page > 1) {
        newPage = page - 1;
      } else if (isNext && page < Math.ceil(filterCount / limit)) {
        newPage = page + 1;
      } else if (!isPrev && !isNext && !isNaN(+e.target.textContent)) {
        newPage = +e.target.textContent;
      }

      if (newPage) {
        setPage(newPage);
      }
    },
    [page, filterCount, limit]
  );

  return (
    <div>
      <PageHead current="Manage Categories">
        <Head
          title="Manage Categories"
          onClick={() => router.push("/categories/new")}
        >
          Create new Category
        </Head>
      </PageHead>
      <Container>
        <Card>
          <div className="mb-4">
            <SearchInput
              valueChange={handleSearchChange}
              value={search}
              placeHolder="Search by category name"
              defaultInput={true}
            />
          </div>
          <div className="categorysList">
            <Table
              columns={columns}
              data={categoriesList}
              loading={dataLoading}
              onRefresh={handleRefresh}
            />
          </div>
          <div className="tableFooter">
            <div className="limit">
              <span>View</span>
              <select onChange={(e) => setLimit(e.target.value)}>
                <option value={6}>6</option>
                <option value={15}>15</option>
              </select>
              <span>Categories per page</span>
            </div>
            <Pagination
              count={Math.ceil(filterCount / limit)}
              shape="rounded"
              onClick={handlePaginate}
            />
          </div>
        </Card>
      </Container>

      <Toaster position="bottom-left" reverseOrder={true} />
      <ToastContainer transition={Slide} />
    </div>
  );
};

export default CategoryPage;
