with open('api/views.py', 'r') as f:
    lines = f.readlines()

content = ''.join(lines)

# Show what we have for FollowingFeedView
idx = content.find('class FollowingFeedView')
print("=== FollowingFeedView ===")
print(repr(content[idx:idx+300]))

# Show ChatView get method
idx2 = content.find('class ChatView')
print("=== ChatView ===")
print(repr(content[idx2:idx2+400]))

# Show comment create section
idx3 = content.find('comment = Comment.objects.create')
print("=== Comment create ===")
print(repr(content[idx3:idx3+200]))