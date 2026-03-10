import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseReviews, submitReview, deleteReview } from '../../store/reviewSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { UserRole } from '@shared/index';

interface ReviewSectionProps {
  courseId: string;
  isEnrolled: boolean;
  isOwner: boolean;
}

export default function ReviewSection({ courseId, isEnrolled, isOwner }: ReviewSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { reviews, avgRating, totalReviews, isLoading, error } = useSelector((state: RootState) => state.review);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCourseReviews(courseId));
  }, [dispatch, courseId]);

  const hasReviewed = reviews.some(r => r.studentId === currentUser?.id);
  const isStudent = currentUser?.role === UserRole.STUDENT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(submitReview({ courseId, rating, comment })).unwrap();
      toast.success('Review submitted successfully!');
      setRating(0);
      setHoverRating(0);
      setComment('');
    } catch (err: any) {
      toast.error(err || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success('Review deleted');
    } catch (err: any) {
      toast.error(err || 'Failed to delete review');
    }
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return (
      <div className={`flex items-center ${interactive ? 'cursor-pointer' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive ? star <= (hoverRating || rating) : star <= currentRating;
          const Icon = isFilled ? StarIconSolid : StarIconOutline;
          return (
            <Icon
              key={star}
              className={`w-6 h-6 ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} transition-colors`}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && setRating(star)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-8 md:p-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
        <span>Reviews & Ratings</span>
        {totalReviews > 0 && (
          <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-700/50">
            <StarIconSolid className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="font-bold text-yellow-800 dark:text-yellow-200">{avgRating.toFixed(1)}</span>
            <span className="text-yellow-600 dark:text-yellow-400/70 ml-2 text-sm">({totalReviews} reviews)</span>
          </div>
        )}
      </h2>

      {/* Submission Form */}
      {isStudent && isEnrolled && !hasReviewed && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
              {renderStars(rating, true)}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Share your experience with this course..."
                maxLength={1000}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* General Guidance */}
      {isStudent && !isEnrolled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl p-4 mb-8 text-sm border border-blue-100 dark:border-blue-800">
          Enroll in this course to leave a review.
        </div>
      )}
      {isStudent && isEnrolled && hasReviewed && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-xl p-4 mb-8 text-sm border border-green-100 dark:border-green-800">
          You have already reviewed this course. Thank you for your feedback!
        </div>
      )}

      {/* Loading / Error States */}
      {isLoading && reviews.length === 0 && <p className="text-gray-500 py-4">Loading reviews...</p>}
      {error && <p className="text-red-500 py-4">{error}</p>}

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <StarIconOutline className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0 flex items-center justify-between md:flex-col md:items-start md:justify-start md:w-48 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center space-x-3 mb-2">
                  {review.student?.avatarUrl ? (
                    <img src={review.student.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {review.student?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{review.student?.username || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="md:mt-2">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {review.comment || <span className="italic opacity-50">No written feedback.</span>}
                </p>
                {(isOwner || currentUser?.id === review.studentId) && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Delete Review"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
