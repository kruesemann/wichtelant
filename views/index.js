const initialize = (function() {

    let navbar_list;
    let navbar_add;
    let navbar_email;
    let navbar_draw;

    let notifications;

    let box_list;
    let box_details;
    let box_add;
    let box_email;

    let list;
    let details_name;
    let details_email;
    let details_candidates;
    let details_wishlist;
    let details_button;
    let details_form;

    let add_name;
    let add_email;
    let add_wishlist;
    let add_form;

    let email_form;

    const data = [];

    function initialize() {
        navbar_list = document.getElementById("navbar-list");
        navbar_add = document.getElementById("navbar-add");
        navbar_email = document.getElementById("navbar-email");
        navbar_draw = document.getElementById("navbar-draw");

        notifications = document.getElementById("notifications");
        
        box_list = document.getElementById("box-list");
        box_details = document.getElementById("box-details");
        box_add = document.getElementById("box-add");
        box_email = document.getElementById("box-email");

        list = document.getElementById("list");
        details_name = document.getElementById("details-name");
        details_email = document.getElementById("details-email");
        details_candidates = document.getElementById("details-candidates");
        details_wishlist = document.getElementById("details-wishlist");
        details_button = document.getElementById("details-button");
        details_form = document.getElementById("details-form");

        add_name = document.getElementById("add-name");
        add_email = document.getElementById("add-email");
        add_wishlist = document.getElementById("add-wishlist");
        add_form = document.getElementById("add-form");
        
        email_form = document.getElementById("email-form");

        initializeNavbar();
        initializeList();
        initializeDetails();
        initializeAdd();
        initializeEmail();

        notifications.addEventListener("click", _ => {
            notifications.style.display = "none";
        });

        document.addEventListener("click", _ => {
            if (list.selectedIndex != -1) {
                list.options[list.selectedIndex].selected = false;
                box_details.style = "display: none;"
            }
        });
    }

    function initializeNavbar() {
        function hideAll() {
            box_list.style = "display: none;"
            box_details.style = "display: none;"
            box_add.style = "display: none;"
            box_email.style = "display: none;"
        }

        navbar_list.addEventListener("click", _ => {
            hideAll();
            box_list.style = "display: box;"
        });

        navbar_add.addEventListener("click", _ => {
            hideAll();
            box_add.style = "display: box;"
            add_name.select();
        });

        navbar_email.addEventListener("click", _ => {
            hideAll();
            box_email.style = "display: box;"
        });

        navbar_draw.addEventListener("click", _ => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    showNotification(this.responseText);
                }
            };
            xhttp.open("POST", "/draw", true);
            xhttp.setRequestHeader("Content-Type", "application/JSON");
            xhttp.send(JSON.stringify(data));
        });
    }

    function initializeList() {
        list.addEventListener("click", event => {
            if (list.selectedIndex == -1) return;

            event.stopPropagation();
            resetDetails();
        });

        list.addEventListener("keypress", event => {
            if (event.keyCode === 46) {
                if (list.selectedIndex == -1) return;

                data.splice(list.selectedIndex, 1);

                for (let person of data) {
                    if (person.index > list.selectedIndex) {
                        person.index--;
                    }

                    for (let i = 0; i < person.forbidden.length; i++) {
                        if (person.forbidden[i] === list.selectedIndex) {
                            person.forbidden.splice(i, 1);
                            i--;
                        } else if (person.forbidden[i] > list.selectedIndex) {
                            person.forbidden[i]--;
                        }
                    }
                }

                resetList();
                navbar_list.click();
            }
        });

        resetList();
    }

    function initializeDetails() {
        box_details.addEventListener("click", event => {
            event.stopPropagation();
        });

        details_name.addEventListener("input", _ => {
            function isNameAvailable(name, index) {
                for (let person of data) {
                    if (person.index !== index && person.name === name) {
                        return false;
                    }
                }
                return true;
            }

            if (!isNameAvailable(details_name.value, list.selectedIndex)) {
                details_name.setCustomValidity("Name schon vergeben!");
                details_button.disabled = false;
            } else {
                details_name.setCustomValidity("");

                if (details_name.value !== data[list.selectedIndex].name) {
                    details_name.classList.add("changed");
                    details_button.disabled = false;
                } else {
                    details_name.classList.remove("changed");
                    deactivateDetailsButton();
                }
            }
        });

        details_email.addEventListener("input", _ => {
            if (details_email.value !== data[list.selectedIndex].email) {
                details_email.classList.add("changed");
                details_button.disabled = false;
            } else {
                details_email.classList.remove("changed");
                deactivateDetailsButton();
            }
        });

        details_wishlist.addEventListener("input", _ => {
            if (details_wishlist.value !== data[list.selectedIndex].wishlist) {
                details_wishlist.classList.add("changed");
                details_button.disabled = false;
            } else {
                details_wishlist.classList.remove("changed");
                deactivateDetailsButton();
            }
        });

        details_form.addEventListener("submit", event => {
            event.preventDefault();
            details_name.classList.remove("changed");
            details_email.classList.remove("changed");
            details_candidates.classList.remove("changed");
            details_wishlist.classList.remove("changed");

            data[list.selectedIndex].name = details_name.value;
            data[list.selectedIndex].email = details_email.value;
            data[list.selectedIndex].wishlist = details_wishlist.value;

            let dataIndex = 0;
            for (let child of details_candidates.children) {
                if (dataIndex === list.selectedIndex) dataIndex++;
                
                if (child.firstChild.checked) {
                    removeFromForbidden(dataIndex, list.selectedIndex);
                } else {
                    addToForbidden(dataIndex, list.selectedIndex);
                }
                dataIndex++;
            }

            let currentIndex = list.selectedIndex;
            resetList();
            list.selectedIndex = currentIndex;

            details_button.disabled = true;
        });
    }

    function initializeAdd() {
        add_name.addEventListener("input", _ => {
            function isNameAvailable(name) {
                for (let person of data) {
                    if (person.name === name) {
                        return false;
                    }
                }
                return true;
            }

            if (!isNameAvailable(add_name.value)) {
                add_name.setCustomValidity("Name schon vergeben!");
                return;
            } else {
                add_name.setCustomValidity("");
            }
        });

        add_form.addEventListener("submit", event => {
            event.preventDefault();

            data.push({
                index: data.length,
                name: add_name.value,
                email: add_email.value,
                forbidden: [],
                wishlist: add_wishlist.value,
            });

            add_form.reset();
            add_name.select();

            resetList();
        });
    }

    function initializeEmail() {
        email_form.addEventListener("submit", event => {
            event.preventDefault();

            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    showNotification(this.responseText);
                }
            };
            xhttp.open("POST", "/email", true);
            const formData = new FormData(email_form);
            xhttp.send(formData);

            email_form.reset();
        });
    }

    function showNotification(response) {
        const status = JSON.parse(response);

        if (status.text) {
            notifications.innerHTML = status.text;
            notifications.style.display = "block";
            notifications.style.background = status.error ? "#880000" : "#226600";
        }
    }

    function resetList() {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        list.size = list.length < 2 ? 2 : list.length;
        for (let person of data) {
            let option = document.createElement("OPTION");
            option.text = person.name;
            list.add(option);
        }
    }

    function resetDetails() {
        function isForbidden(person, index) {
            for (let forbidden of person.forbidden) {
                if (forbidden === index) {
                    return true;
                }
            }
            return false;
        }

        function flagCandidateChange() {
            function checkboxIsChanged(checkbox, dataIndex) {
                return isForbidden(data[list.selectedIndex], dataIndex) ? checkbox.checked : !checkbox.checked;
            }

            let dataIndex = 0;
            for (let child of details_candidates.children) {
                if (dataIndex === list.selectedIndex) dataIndex++;

                if (checkboxIsChanged(child.firstChild, dataIndex)) {
                    details_candidates.classList.add("changed");
                    details_button.disabled = false;
                    return;
                }
                dataIndex++;
            }

            details_candidates.classList.remove("changed");
            deactivateDetailsButton();
        }

        while (details_candidates.firstChild) {
            details_candidates.firstChild.removeEventListener("input", flagCandidateChange);
            details_candidates.removeChild(details_candidates.firstChild);
        }

        details_name.classList.remove("changed");
        details_email.classList.remove("changed");
        details_candidates.classList.remove("changed");
        details_wishlist.classList.remove("changed");
        details_button.disabled = true;

        for (let person of data) {
            if (person.index === list.selectedIndex) continue;
            
            let div = document.createElement("DIV");
            let checkbox = document.createElement("INPUT");
            checkbox.setAttribute("type", "checkbox");

            if (!isForbidden(data[list.selectedIndex], person.index)) {
                checkbox.setAttribute("checked", true);
            }

            div.addEventListener("input", flagCandidateChange);
            details_candidates.appendChild(div);
            div.appendChild(checkbox);
            div.innerHTML += person.name + "<br>";
        }

        box_details.style = "display: box;"
        details_name.value = data[list.selectedIndex].name;
        details_email.value = data[list.selectedIndex].email;
        details_wishlist.value = data[list.selectedIndex].wishlist;
    }

    function addToForbidden(i, j) {
        for (let k = 0; k < data[i].forbidden.length; k++) {
            if (data[i].forbidden[k] === j) {
                return;
            }
        }
        data[i].forbidden.push(j);
        data[j].forbidden.push(i);
    }

    function removeFromForbidden(i, j) {
        for (let k = 0; k < data[i].forbidden.length; k++) {
            if (data[i].forbidden[k] === j) {
                data[i].forbidden.splice(k, 1);
                break;
            }
        }
        for (let k = 0; k < data[j].forbidden.length; k++) {
            if (data[j].forbidden[k] === i) {
                data[j].forbidden.splice(k, 1);
                break;
            }
        }
    }

    function deactivateDetailsButton() {
        if (!details_name.classList.contains("changed")
        && !details_email.classList.contains("changed")
        && !details_candidates.classList.contains("changed")
        && !details_wishlist.classList.contains("changed")) {
            details_button.disabled = true;
        }
    }

    return initialize;
})();

initialize();
