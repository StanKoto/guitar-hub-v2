const emptyErrors = (customErrors) => {
  for (const error of customErrors) {
    error.element.textContent = '';
  }
};

const makeRequest = async (url, method, redirectUrl, body, customErrors, message) => {
  try {
    const params = {method};
    if (body && !(body instanceof FormData)) params.headers = { 'Content-Type': 'application/json' }
    if (method !== 'DELETE') params.body = body;
    const res = await fetch(url, params);
    const data = await res.json();
    if (data.errors) {
      for (const error of customErrors) {
        error.element.textContent = data.errors[error.errorType];
      }
    } else if (data.otherErrors) {
      switch (res.status) {
        case 401:
          location.assign(`/errors/unauthorized?message=${data.message}`);
          break;
        case 404:
          location.assign(`/errors/bad-request?message=${data.message}`);
          break;
        default:
          location.assign('/errors/server-error');
      }
    } else {
      if (data.selfUpdate && data.user.role === 'user') return location.assign('/auth/my-profile')
      switch (redirectUrl) {
        case 'tip':
          redirectUrl = `/tips-overview/tips/${data.tip._id}/${data.tip.slug}`;
          break;
        case 'tip-edit-form':
          redirectUrl = `/tips-overview/tips/${data.tip._id}/${data.tip.slug}/tip-edit-form`;
          break;
        case 'user':
          redirectUrl = `/user-management/users/${data.user._id}/${data.user.slug}`;
          break;
        case 'user-edit-form':
          redirectUrl = `/user-management/users/${data.user._id}/${data.user.slug}/user-edit-form`;
          break;
      }
      if (data.selfDelete) return location.assign('/auth')
      if (message) alert(message)
      location.assign(redirectUrl);
    }
  } catch (err) {
    location.assign('/server-error');
  }
};

const adjustUrl = (paramName, paramValue) => {
  const urlPath = location.pathname;
  const urlQuery = location.search;
  if (urlQuery.length !== 0) { 
    const searchParams = new URLSearchParams(urlQuery);
    if (searchParams.has(paramName)) {
      if (paramName === 'sort' || paramName === 'select') {
        const splitValue = paramValue.split('-');
        const checkValue = splitValue.length === 1 ? splitValue[0] : splitValue[1];
        const keyValuePairs = urlQuery.split('&');
        for (let i = 0; i < keyValuePairs.length; i++) {
          const pair = keyValuePairs[i].split('=');
          if (pair[0].includes(paramName)) {
            if (!pair[1].includes(checkValue)) {
              keyValuePairs[i] += `,${paramValue}`;
            } else {
              const splitValue = pair[1].split(',');
              for (let j = 0; j < splitValue.length; j++) {
                if (splitValue[j].includes(checkValue)) splitValue.splice(j, 1, paramValue)
              }
              keyValuePairs.splice(i, 1, `${pair[0]}=${splitValue.join(',')}`);
            }            
          }
        }
        return `${urlPath}${keyValuePairs.join('&')}`;
      } else {
        searchParams.set(paramName, paramValue);
        return `${urlPath}?${searchParams.toString()}`;
      }
    } else { 
      return `${urlPath}${urlQuery}&${paramName}=${paramValue}`;
    }
  } else {
    return `${urlPath}?${paramName}=${paramValue}`;
  }
};

const setupSorting = (elementId, sortingField) => {
  document.getElementById(elementId).addEventListener('click', (e) => {
    e.preventDefault();

    const url = adjustUrl('sort', sortingField);
    location.assign(url);
  });
};

const setupSearch = (searchForm, inputName) => {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const searchText = searchForm[inputName].value;
    if (searchText.length === 0) return location.reload()
  
    const url = adjustUrl('textSearch', searchText);
    location.assign(url);
  });
};

const setupPagination = (elementIds) => {
  for (const id of elementIds) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
  
        const url = adjustUrl('page', element.value);
        location.assign(url);
      });
    }
  }
};

export { emptyErrors, makeRequest, adjustUrl, setupSorting, setupSearch, setupPagination };