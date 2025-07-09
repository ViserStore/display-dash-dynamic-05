
interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage: (page: number) => void;
  hasTransactions?: boolean;
}

const CustomPagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onGoToPage,
  hasTransactions = true
}: CustomPaginationProps) => {
  // Don't show pagination if no transactions or only one page
  if (!hasTransactions || totalPages <= 1) return null;

  return (
    <div className="_fixed_lq8ol_326 bottom-[60px] _max-w-[480px]_lq8ol_314 _container_lq8ol_465 _mx-auto_lq8ol_1 _px-[8px]_lq8ol_284 _flex_lq8ol_19 _justify-center_lq8ol_106 _items-center_lq8ol_27 my-3">
      <div className="join _opacity-50_lq8ol_363">
        <button 
          className={`join-item btn !min-h-[2rem] h-[2rem] ${!hasPreviousPage ? 'btn-disabled' : ''}`}
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
        >
          «
        </button>
        
        <button 
          className="join-item btn !min-h-[2rem] h-[2rem] btn-active"
          onClick={() => onGoToPage(currentPage)}
        >
          {currentPage}
        </button>
        
        <button 
          className={`join-item btn !min-h-[2rem] h-[2rem] ${!hasNextPage ? 'btn-disabled' : ''}`}
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
