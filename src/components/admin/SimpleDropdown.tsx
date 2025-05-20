import React, { useState, useRef, useEffect } from "react";
import { Button, Icon } from "@salesforce/design-system-react";

interface DropdownOption {
  id: string;
  label: string;
}

interface SimpleDropdownProps {
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  value: string;
  buttonVariant?: "brand" | "neutral" | "outline-brand";
  label?: string;
  iconCategory?: string;
  iconName?: string;
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  options,
  onSelect,
  value,
  buttonVariant = "neutral",
  label = "Select an option",
  iconCategory,
  iconName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((option) => option.id === value);

  return (
    <div
      className="slds-dropdown-trigger slds-dropdown-trigger_click"
      ref={dropdownRef}
    >
      <Button
        aria-haspopup="true"
        variant={buttonVariant}
        onClick={() => setIsOpen(!isOpen)}
        className="slds-button slds-button_neutral"
        iconPosition="right"
        iconCategory={iconCategory}
        iconName={isOpen ? "chevronup" : "chevrondown"}
      >
        {iconName && iconCategory && (
          <Icon
            category={iconCategory}
            name={iconName}
            className="slds-button__icon slds-button__icon_left"
            size="x-small"
          />
        )}
        {selectedOption ? selectedOption.label : label}
      </Button>

      {isOpen && (
        <div className="slds-dropdown slds-dropdown_left">
          <ul className="slds-dropdown__list" role="menu">
            {options.map((option) => (
              <li
                key={option.id}
                className="slds-dropdown__item"
                role="presentation"
              >
                <a
                  href="#"
                  role="menuitem"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`slds-truncate ${option.id === value ? "slds-is-selected" : ""}`}
                >
                  {option.id === value && (
                    <Icon
                      category="utility"
                      name="check"
                      size="x-small"
                      className="slds-m-right_x-small"
                    />
                  )}
                  {option.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SimpleDropdown;
