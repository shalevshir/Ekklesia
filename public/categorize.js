// Array to store selected choices
let selectedChoices = [];
const dataToSend = [];
let documentId = '';
// Function to handle choice selection
function handleChoiceSelection() {
    const mainCategoryElm = document.getElementById('categoryInput');
    const subCategoryElm = document.getElementById('subCategoryInput');
    const selectedChoice = subCategoryElm.value;
    const selectedOption = document.querySelector(`#subCategories option[value="${selectedChoice}"]`);
    const subCategoryId = selectedOption?.getAttribute('data-id');
    const mainCategory = mainCategoryElm.value;
    const subCategoryName = selectedChoice;

    if (selectedChoice && !selectedChoices.includes(selectedChoice)) {
        selectedChoices.push(selectedChoice);
        dataToSend.push({ subCategoryId, subCategoryName, mainCategory });
        // Create a new element to display the selected choice
        const choiceElement = document.createElement('div');
        choiceElement.textContent = selectedChoice;

        // Create a button to remove the selected choice
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.addEventListener('click', () => {
            // Remove the choice from the selectedChoices array
            selectedChoices = selectedChoices.filter(choice => choice !== selectedChoice);
            // Remove the choice element from the DOM
            choiceElement.remove();
            removeButton.remove();
            
            dataToSend.splice(dataToSend.findIndex((item) => item.subCategoryName === selectedChoice), 1);
        });

        // Append the choice element and remove button to the selectedChoices container
        document.getElementById('selectedChoices').appendChild(choiceElement);
        document.getElementById('selectedChoices').appendChild(removeButton);
    }

    // Clear the input after selection
    subCategoryElm.value = '';
    mainCategoryElm.value = '';

}

async function fetchNextItem() {
        fetch('https://ekklesia-f0328075e83f.herokuapp.com/query/nextQuery')
            .then(response => response.json())
            .then(async data => {
                if(!data){
                    alert('No more queries to categorize')
                    return;
                }
                const { _id: id, name, queryLink, replyLink, type, status, submitDate, replyDate, replyMinister} = data;
                documentId = id;
                console.log(data)

                const documentJson = document.getElementById('documentJson');
                documentJson.innerHTML = `
                <p>Id: ${id}</p>
                <p>Name: ${name}</p>
                <p>Reply Ministry: ${replyMinister}</p>
                ${queryLink?`<p><a href="${queryLink}" target="_blank">Query Link</a></p>`:'No Query Link Available'}
                ${replyLink?`<p><a href="${replyLink}" target="_blank">Reply Link</a></p>`:'No Reply Link Available'}
                <p>Type: ${type}</p>
                <p>Status: ${status}</p>
                <p>Submit Date: ${submitDate}</p>
                <p>Reply Date: ${replyDate}</p>
                `;

                if(queryLink){
                    const queryContentStream =await  fetch(`https://ekklesia-f0328075e83f.herokuapp.com/fileContent?url=${queryLink}`)
                    let data = await queryContentStream.text();

                    const queryContentElm = document.getElementById('query-content');
                    queryContentElm.innerHTML = data
                }
            });
    }
// Attach event listener to subcategory input
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('subCategoryInput').addEventListener('change', handleChoiceSelection);
    
    
    await fetchNextItem();
    // Fetch categories from the server on page load
    const response = await fetch('https://ekklesia-f0328075e83f.herokuapp.com/category');
    const categories = await response.json();

    const categoriesListElm = document.getElementById('categoriesList');
    const subCategoriesListElm = document.getElementById('subCategories');
    // Populate the datalist with categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.setAttribute('data-id', category._id);
        categoriesListElm.appendChild(option);
    });

    // Function to handle category selection
    function handleCategorySelection() {
        const selectedCategory = document.getElementById('categoryInput').value;
        const selectedOption = categories.find(category => category.name === selectedCategory);
        const subCategoriesListElm = document.getElementById('subCategories');
        subCategoriesListElm.innerHTML = ''; // Clear existing options

        if (selectedOption) {
            selectedOption.subCategories.forEach(subcategory => {
                const subOption = document.createElement('option');
                subOption.value = subcategory.name;
                subOption.setAttribute('data-id', subcategory._id);
                subCategoriesListElm.appendChild(subOption);
            });
        }
    }

    // Attach event listener to category input
    document.getElementById('categoryInput').addEventListener('change', handleCategorySelection);


});

async function askGpt(){
    const askGptElem = document.getElementById('askGptButton');
    const currentColor = askGptElem.style.backgroundColor;
    askGptElem.disabled = true;
    askGptElem.textContent = 'Asking GPT...';
    askGptElem.style.pointerEvents = 'none';
    askGptElem.style.backgroundColor = '#ccc';

    const responseElem = document.getElementById('gptResponseContent');
    responseElem.innerHTML = 'GPT is thinking...'
    const response = await fetch('https://ekklesia-f0328075e83f.herokuapp.com/category/query/' + documentId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const responseData = await response.json();
    console.log(responseData)
    const responseHtml = responseData.map((item) => {
        return `<div>
        <p>Category: ${item.mainCategory}</p>
        <p>SubCategory: ${item.subCategory}</p>
        <p>Reason: ${item.reasoning||item.reason}</p>
        </div>
        <hr>`; // Add <hr> tag after each item
    }).join('');
    responseElem.innerHTML = responseHtml;
    askGptElem.disabled = false;
    askGptElem.textContent = 'Ask Again';
    askGptElem.style.pointerEvents = 'auto';
    askGptElem.style.backgroundColor = currentColor;

    // const responseData = await response.json();
}
// Function to handle form submission
async function submitCategory() {
    const submitButtonElement = document.getElementById('submitButton');
    // Disable the submit button to prevent multiple submissions
    submitButtonElement.disabled = true;
    submitButtonElement.textContent = 'Submitting...';
    submitButtonElement.style.pointerEvents = 'none';
    submitButtonElement.style.backgroundColor = '#ccc';

    const response = await fetch('https://ekklesia-f0328075e83f.herokuapp.com/query/categoryToQuery', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId,
            categories: dataToSend
        }),
    });

    alert('Category submitted successfully');
    // const responseData = await response.json();
    //refresh page
    window.location.reload();
}
