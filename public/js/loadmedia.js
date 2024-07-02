

// Fetch the file list from the server and display the images
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/infos')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        for (const key in data.files) {
          var num = key 
          num++
          console.log(num)
          fetch('/api/infos/' + num)
          .then(response => response.json())
          .then(data2 => {
            const name = document.createElement('div')
            const parent = document.getElementById('parent')
            name.innerHTML = `<a href="/info?id=${num}">${data2.name}</a>`
            parent.appendChild(name)
          })
          
        }
      })
      .catch(error => console.error('Error fetching file list:', error));
  });
  