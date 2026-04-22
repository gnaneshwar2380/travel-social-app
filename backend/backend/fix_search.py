with open('api/views.py', 'r') as f:
    content = f.read()

old = '''class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'users': [], 'posts': []})

        users = User.objects.filter(
            Q(username__icontains=query) | Q(full_name__icontains=query)
        )[:10]

        posts = ExperiencePost.objects.filter(
            Q(title__icontains=query)
        )[:10]

        return Response({
            'users': UserSerializer(users, many=True).data,
            'posts': ExperiencePostSerializer(posts, many=True, context={'request': request}).data
        })'''

new = '''class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'users': [], 'posts': [], 'general_posts': [], 'trips': []})

        users = User.objects.filter(
            Q(username__icontains=query) | Q(full_name__icontains=query)
        ).exclude(id=request.user.id)[:10]

        posts = ExperiencePost.objects.filter(
            Q(title__icontains=query)
        ).order_by('-created_at')[:10]

        general_posts = GeneralPost.objects.filter(
            Q(description__icontains=query)
        ).order_by('-created_at')[:10]

        trips = JoinableTripPost.objects.filter(
            Q(title__icontains=query) | Q(destination__icontains=query)
        ).order_by('-created_at')[:10]

        return Response({
            'users': UserSerializer(users, many=True).data,
            'posts': ExperiencePostSerializer(posts, many=True, context={'request': request}).data,
            'general_posts': GeneralPostSerializer(general_posts, many=True, context={'request': request}).data,
            'trips': JoinableTripPostSerializer(trips, many=True, context={'request': request}).data,
        })'''

if old in content:
    content = content.replace(old, new)
    with open('api/views.py', 'w') as f:
        f.write(content)
    print("SearchView fixed!")
else:
    print("NOT FOUND - check manually")