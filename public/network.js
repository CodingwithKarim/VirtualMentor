let requestConnection = document.querySelectorAll('.btn-sm')
console.log(requestConnection)

Array.from(requestConnection).forEach(function(element) {
    element.addEventListener('click', function(e){
        console.log(e.target.dataset.name)
        console.log(e.target.dataset.id)
        let id = e.target.dataset.id
        let user = e.target.dataset.name
        let mentorName = e.target.dataset.mentor
        
      fetch('requestConnection', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'id' : id,
          'user': user,
          'mentorName': mentorName
        })
      })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        // window.location.reload(true)
      })
    });
});
