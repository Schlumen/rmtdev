import { createContext, useCallback, useMemo, useState } from "react";
import { useSearchQuery, useSearchTextContext } from "../lib/hooks";
import { RESULTS_PER_PAGE } from "../lib/constants";
import { SortBy, PageDirection, JobItem } from "../lib/types";

type JobItemsTextContext = {
  jobItems: JobItem[] | undefined;
  jobItemsSortedAndSliced: JobItem[];
  isLoading: boolean;
  totalNumberOfResults: number;
  totalNumberOfPages: number;
  sortBy: SortBy;
  currentPage: number;
  handleChangePage: (direction: PageDirection) => void;
  handleChangeSortBy: (newSortBy: SortBy) => void;
};

export const JobItemsTextContext = createContext<JobItemsTextContext | null>(
  null
);

export default function JobItemsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Other Context
  const { debouncedSearchText } = useSearchTextContext();

  // State
  const { jobItems, isLoading } = useSearchQuery(debouncedSearchText);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("relevant");

  // Derived state / Computed state
  const totalNumberOfResults = jobItems?.length || 0;
  const totalNumberOfPages = Math.ceil(totalNumberOfResults / RESULTS_PER_PAGE);

  const jobItemsSorted = useMemo(
    () =>
      [...(jobItems || [])].sort((a, b) => {
        if (sortBy === "relevant") {
          return b.relevanceScore - a.relevanceScore;
        } else {
          return a.daysAgo - b.daysAgo;
        }
      }),
    [sortBy, jobItems]
  );

  const jobItemsSortedAndSliced = useMemo(
    () =>
      jobItemsSorted.slice(
        currentPage * RESULTS_PER_PAGE - RESULTS_PER_PAGE,
        currentPage * RESULTS_PER_PAGE
      ),
    [jobItemsSorted, currentPage]
  );

  // Event handlers
  const handleChangePage = useCallback((direction: PageDirection) => {
    if (direction === "next") {
      setCurrentPage(prev => prev + 1);
    } else if (direction === "previous") {
      setCurrentPage(prev => prev - 1);
    }
  }, []);

  const handleChangeSortBy = useCallback((newSortBy: SortBy) => {
    setCurrentPage(1);
    setSortBy(newSortBy);
  }, []);

  return (
    <JobItemsTextContext.Provider
      value={useMemo(
        () => ({
          jobItems,
          jobItemsSortedAndSliced,
          isLoading,
          totalNumberOfResults,
          totalNumberOfPages,
          sortBy,
          currentPage,
          handleChangePage,
          handleChangeSortBy,
        }),
        [
          jobItems,
          jobItemsSortedAndSliced,
          isLoading,
          totalNumberOfResults,
          totalNumberOfPages,
          sortBy,
          currentPage,
          handleChangePage,
          handleChangeSortBy,
        ]
      )}
    >
      {children}
    </JobItemsTextContext.Provider>
  );
}
