import React from "react";
import {
  ButtonGroup,
  Button,
  IconSettings,
} from "@salesforce/design-system-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const renderPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    pages.push(
      <Button
        key="prev"
        disabled={currentPage === 1 || isLoading}
        iconCategory="utility"
        iconName="left"
        iconPosition="left"
        variant="neutral"
        onClick={() => onPageChange(currentPage - 1)}
        className="slds-button_neutral"
      />,
    );

    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          label="1"
          variant={currentPage === 1 ? "brand" : "neutral"}
          onClick={() => onPageChange(1)}
          disabled={isLoading}
          className={
            currentPage === 1 ? "slds-button_brand" : "slds-button_neutral"
          }
        />,
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="slds-p-horizontal_x-small">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          label={i.toString()}
          variant={currentPage === i ? "brand" : "neutral"}
          onClick={() => onPageChange(i)}
          disabled={isLoading}
          className={
            currentPage === i ? "slds-button_brand" : "slds-button_neutral"
          }
        />,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="slds-p-horizontal_x-small">
            ...
          </span>,
        );
      }

      pages.push(
        <Button
          key={totalPages}
          label={totalPages.toString()}
          variant={currentPage === totalPages ? "brand" : "neutral"}
          onClick={() => onPageChange(totalPages)}
          disabled={isLoading}
          className={
            currentPage === totalPages
              ? "slds-button_brand"
              : "slds-button_neutral"
          }
        />,
      );
    }

    pages.push(
      <Button
        key="next"
        disabled={currentPage === totalPages || isLoading}
        iconCategory="utility"
        iconName="right"
        iconPosition="right"
        variant="neutral"
        onClick={() => onPageChange(currentPage + 1)}
        className="slds-button_neutral"
      />,
    );

    return pages;
  };

  return (
    <IconSettings iconPath="/assets/icons">
      <div className="slds-grid slds-grid_align-center slds-p-vertical_medium">
        <ButtonGroup>{renderPageNumbers()}</ButtonGroup>
      </div>
    </IconSettings>
  );
};

export default Pagination;
