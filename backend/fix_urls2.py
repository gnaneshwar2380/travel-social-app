with open('api/urls.py', 'r') as f:
    content = f.read()

old = "    path('joinable-trips/<int:trip_id>/interest/', views.JoinableTripInterestView.as_view()),"
new = "    path('joinable-trips/<int:trip_id>/interest/', views.JoinableTripInterestView.as_view()),\n    path('joinable-trips/<int:trip_id>/my-request/', views.JoinableTripMyRequestView.as_view()),"

if old in content:
    content = content.replace(old, new)
    with open('api/urls.py', 'w') as f:
        f.write(content)
    print("URL added!")
else:
    print("NOT FOUND")