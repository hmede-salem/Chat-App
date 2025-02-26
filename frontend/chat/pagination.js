const paginationNumbers = document.getElementById("pagination-numbers");
const paginatedList = document.getElementById("chatBox");
const listItems = paginatedList.querySelectorAll("li");
const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");

const paginationLimit = 3;
const pageCount = Math.ceil(listItems.length / paginationLimit);
var currentPage = 1;

const disableButton = (button) => {
    button.setAttribute("disabled", true);
};

const enableButton = (button) => {
    button.removeAttribute("disabled");
};

const handlePageButtonsStatus = () => {
    if (currentPage == 1) {
        disableButton(prevButton);
    } else {
        enableButton(prevButton);
    }

    if (pageCount == currentPage) {
        disableButton(nextButton);
    } else {
        enableButton(nextButton);
    }
};

const handleActivePageNumber = () => {
    document.querySelectorAll("button.pagination-number").forEach((button) => {
        button.classList.remove("active");
        const pageIndex = Number(button.getAttribute("page-index"));
        if (pageIndex == currentPage) {
            button.classList.add("active");
        }
    });
};

const appendPageNumber = (index) => {
    const pageNumber = document.createElement("button");
    pageNumber.className = "pagination-number";
    pageNumber.innerHTML = index;
    pageNumber.setAttribute("page-index", index);
    pageNumber.setAttribute("aria-label", "Page " + index);
    paginationNumbers.appendChild(pageNumber);
};

const getPaginationNumbers = () => {
    for (let i = 1; i <= pageCount; i++) {
        appendPageNumber(i);
    }
};

const setCurrentPage = (pageNum) => {
    currentPage = pageNum;

    handleActivePageNumber();
    handlePageButtonsStatus();

    const prevRange = (pageNum - 1) * paginationLimit;
    const currRange = pageNum * paginationLimit;

    listItems.forEach((item, index) => {
        item.setAttribute("hidden", "hidden")
        if (index >= prevRange && index < currRange) {
            item.removeAttribute("hidden", "hidden")
        }
    });
};

getPaginationNumbers();
setCurrentPage(1);

prevButton.addEventListener("click", () => {
    setCurrentPage(currentPage - 1);
});

nextButton.addEventListener("click", () => {
    setCurrentPage(parseInt(currentPage) + 1);
});


document.querySelectorAll("button.pagination-number").forEach((button) => {
    const pageIndex = button.getAttribute("page-index");
    if (pageIndex) {
        button.addEventListener("click", () => {
            setCurrentPage(pageIndex);
        });
    }
});