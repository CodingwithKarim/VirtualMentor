let acceptRequest = document.querySelectorAll('.fa-vote-yea')
let declineRequest = document.querySelectorAll('.fa-user-minus')

Array.from(acceptRequest).forEach(function(element) {
    element.addEventListener('click', function(e){
        console.log(e.target.dataset.id)
        let id = e.target.dataset.id
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