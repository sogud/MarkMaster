function saveData(key: string, value: string | ArrayBuffer | null) {
  chrome.storage.local.set({ [key]: value }, function () {
    console.log('Value is set to ' + value);
  });
}

function getData(key: string, callback: any) {
  chrome.storage.local.get(key, function (result) {
    callback(result[key]);
  });
}

function deleteData(key: string) {
  chrome.storage.local.remove(key, function () {
    console.log('Value is removed for ' + key);
  });
}

function updateData(key: string, value: string) {
  chrome.storage.local.set({ [key]: value }, function () {
    console.log('Value is updated to ' + value);
  });
}

function getFavicon(url: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
}
function getFavicon2(url: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
}

function getFaviconAndSaveToCache(url: string, callback: any) {
  const isFromChina = window.navigator.language.toLowerCase().includes('zh');
  // It depends on whether the user is accessing the website from China or not
  // If the user is accessing from China, use getFavicon2
  // Otherwise, use getFavicon
  const getFaviconMethod = isFromChina ? getFavicon2 : getFavicon;
  const faviconUrl = getFaviconMethod(url);

  fetch(faviconUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data = reader.result;
        callback(base64data);
        saveData(url, base64data);
      };
    })
    .catch((error) => console.error(error));
}

export function getFaviconFromCache(url: string, callback: any) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const urlWithoutWWW = domain.replace('www.', '');
  const urlWithoutProtocol = urlWithoutWWW.replace(/(^\w+:|^)\/\//, '');
  const urlWithoutPath = urlWithoutProtocol.split('/')[0];
  const processedUrl = urlWithoutPath;
  getData(processedUrl, function (result: any) {
    if (result) {
      callback(result);
    } else {
      getFaviconAndSaveToCache(processedUrl, callback);
    }
  });
}
