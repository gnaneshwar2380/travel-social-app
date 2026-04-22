old = '''    path('joinable-trips/<int:trip_id>/join/', views.TripJoinRequestView.as_view()),
    path('joinable-trips/requests/<int:request_id>/approve/', views.TripJoinRequestApproveView.as_view()),
    path('joinable-trips/requests/<int:request_id>/reject/', views.JoinableTripRejectView.as_view()),'''

new = '''    path('joinable-trips/<int:trip_id>/join/', views.TripJoinRequestView.as_view()),
    path('joinable-trips/<int:trip_id>/interest/', views.JoinableTripInterestView.as_view()),
    path('joinable-trips/<int:trip_id>/requests/', views.JoinableTripRequestsView.as_view()),
    path('joinable-trips/requests/<int:request_id>/approve/', views.TripJoinRequestApproveView.as_view()),
    path('joinable-trips/requests/<int:request_id>/accept/', views.JoinableTripAcceptView.as_view()),
    path('joinable-trips/requests/<int:request_id>/reject/', views.JoinableTripRejectView.as_view()),'''

with open('api/urls.py', 'r') as f:
    content = f.read()

if old in content:
    content = content.replace(old, new)
    with open('api/urls.py', 'w') as f:
        f.write(content)
    print("URLs fixed!")
else:
    print("NOT FOUND - check manually")