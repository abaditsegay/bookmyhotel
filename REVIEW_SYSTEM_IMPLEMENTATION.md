// Review System Implementation for BookMyHotel

// 1. Backend Entity
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "reservation_id")
    private Long reservationId; // Link to verified booking
    
    @Column(nullable = false)
    private Integer rating; // 1-5 stars
    
    @Column(length = 1000)
    private String comment;
    
    @Column(name = "verified_booking")
    private Boolean verifiedBooking = false;
    
    @ElementCollection
    @CollectionTable(name = "review_photos")
    private List<String> photoUrls;
    
    @Column(name = "helpful_count")
    private Integer helpfulCount = 0;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;
}

// 2. Frontend Review Component
interface ReviewProps {
    hotelId: number;
    allowWriteReview?: boolean;
}

export const ReviewSection: React.FC<ReviewProps> = ({ hotelId, allowWriteReview }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [showWriteReview, setShowWriteReview] = useState(false);
    
    return (
        <Card>
            <CardHeader>
                <Typography variant="h6">Guest Reviews</Typography>
                <Box display="flex" alignItems="center">
                    <Rating value={averageRating} readOnly precision={0.1} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                        {averageRating.toFixed(1)} ({reviews.length} reviews)
                    </Typography>
                </Box>
            </CardHeader>
            
            <CardContent>
                {/* Review Statistics */}
                <ReviewStatistics reviews={reviews} />
                
                {/* Review List */}
                <ReviewList reviews={reviews} />
                
                {/* Write Review Button */}
                {allowWriteReview && (
                    <Button 
                        variant="outlined" 
                        onClick={() => setShowWriteReview(true)}
                        startIcon={<EditIcon />}
                    >
                        Write a Review
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
