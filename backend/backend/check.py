with open('api/views.py', 'r') as f:
    content = f.read()

idx = content.find('class JoinableTripListCreateView')
print("=== JoinableTripListCreateView ===")
print(content[idx:idx+800])

idx2 = content.find('class FollowingFeedView')
print("=== FollowingFeedView ===")
print(content[idx2:idx2+500])

idx3 = content.find('class SavedPostsListView')
print("=== SavedPostsListView ===")
print(content[idx3:idx3+400])