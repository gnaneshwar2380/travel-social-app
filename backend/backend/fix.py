with open('api/views.py', 'r') as f:
    content = f.read()

# Fix 1 - FollowingFeedView
old_following = '''class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        posts = ExperiencePost.objects.filter(author_id__in=following_ids).order_by('-created_at')        
        serializer = ExperiencePostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)'''

new_following = '''class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        feed = []

        experience_posts = ExperiencePost.objects.filter(author_id__in=following_ids).order_by('-created_at')[:20]
        for post in experience_posts:
            data = ExperiencePostSerializer(post, context={'request': request}).data
            data['post_type'] = 'experience'
            feed.append(data)

        general_posts = GeneralPost.objects.filter(author_id__in=following_ids).order_by('-created_at')[:20]
        for post in general_posts:
            data = GeneralPostSerializer(post, context={'request': request}).data
            data['post_type'] = 'general'
            feed.append(data)

        joinable_trips = JoinableTripPost.objects.filter(creator_id__in=following_ids).order_by('-created_at')[:20]
        for post in joinable_trips:
            data = JoinableTripPostSerializer(post, context={'request': request}).data
            data['post_type'] = 'joinable'
            feed.append(data)

        feed.sort(key=lambda x: x['created_at'], reverse=True)
        return Response(feed)'''

if old_following in content:
    content = content.replace(old_following, new_following)
    print("FollowingFeedView fixed!")
else:
    print("FollowingFeedView NOT found - manual fix needed")

# Fix 2 - SavedPostsListView
old_saved = '''class SavedPostsListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        saved = SavedPost.objects.filter(user=request.user).order_by('-saved_at')
        posts = []
        for item in saved:
            obj = item.content_object
            if isinstance(obj, ExperiencePost):
                posts.append(ExperiencePostSerializer(obj, context={'request':'''

new_saved = '''class SavedPostsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        saved = SavedPost.objects.filter(user=request.user).order_by('-saved_at')
        posts = []
        for item in saved:
            obj = item.content_object
            if obj is None:
                continue
            if isinstance(obj, ExperiencePost):
                data = ExperiencePostSerializer(obj, context={'request': request}).data
                data['post_type'] = 'experience'
                posts.append(data)
            elif isinstance(obj, GeneralPost):
                data = GeneralPostSerializer(obj, context={'request': request}).data
                data['post_type'] = 'general'
                posts.append(data)
            elif isinstance(obj, JoinableTripPost):
                data = JoinableTripPostSerializer(obj, context={'request': request}).data
                data['post_type'] = 'joinable'
                posts.append(data)
        return Response(posts)'''

# Find and replace SavedPostsListView fully
start = content.find('class SavedPostsListView')
end = content.find('\nclass ', start + 1)
if start != -1 and end != -1:
    content = content[:start] + new_saved + '\n' + content[end:]
    print("SavedPostsListView fixed!")
else:
    print("SavedPostsListView NOT found")

with open('api/views.py', 'w') as f:
    f.write(content)

print("Done! Run: python manage.py runserver")