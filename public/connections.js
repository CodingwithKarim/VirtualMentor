let acceptRequest = document.querySelectorAll('.fa-vote-yea')
let declineRequest = document.querySelectorAll('.fa-user-minus')

Array.from(acceptRequest).forEach(function(element) {
    element.addEventListener('click', function(e){
        console.log(e.target.dataset.id)
        let id = e.target.dataset.id
      fetch('acceptRequest', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'id' : id,
        })
      })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        window.location.reload(true)
      })
    });
});

Array.from(declineRequest).forEach(function (element) {
    element.addEventListener("click", function (e) {
      const id = e.target.dataset.id;
      fetch("declineRequest", {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      }).then(function (response) {
        window.location.reload();
      });
    });
  });